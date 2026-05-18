import type { UploadMoneyDTO } from "../dto/transaction.dto";
import { stripe } from "../utils/stripe";
import { prisma } from '../db/client'

export const transactionService = {
    async createCheckoutSession(userId: number, body: UploadMoneyDTO){
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'WatchYourBid Balance Refill',
                    },
                    unit_amount: body.amount * 100, 
                },
                quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:8080/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:8080/dashboard?status=cancel`,
            metadata: {
                userId: userId.toString(),
            },
        });

        await prisma.transaction.create({
            data: {
                userId: userId,
                amount: body.amount,
                type: 'DEPOSIT',
                status: 'PENDING',
                stripeSessionId: session.id
            }
        });

        return { url: session.url };
    },

    async confirmPayment(sessionId: string) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const transaction = await prisma.transaction.findUnique({
                where: { stripeSessionId: sessionId }
            });

            if (transaction && transaction.status === 'SUCCESS') {
                return { success: true, message: "This payment was already confirmed!" };
            }

            if (transaction && transaction.status === 'PENDING') {
                const userId = parseInt(session.metadata?.userId || "0");

                await prisma.$transaction([
                    prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'SUCCESS' }
                    }),
                    prisma.user.update({
                        where: { id: userId },
                        data: { balance: { increment: transaction.amount } }
                    })
                ]);
                return { 
                    success: true, 
                    amount: transaction.amount,
                    message: `We confirmed your ${transaction.amount} EUR deposit!` 
                };
            }
        }
        throw new Error("Confirm payment failed!");
    },

    async withdrawMoney(userId: number, data: UploadMoneyDTO) {
        
        const amount = data.amount;

        if(!userId){
            throw new Error("User ID not found!")
        }

        if(amount < 0){
            throw new Error("Withdraw amount must be positive!")
        }

        const withdraw = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error("User not found!");
            }

            if (user.balance < amount) {
                throw new Error("Insufficient funds for withdrawal!");
            }

            await tx.user.update({
                where: {id: userId},
                data: { balance: { decrement: amount }}
            });

            await tx.transaction.create({
                data: {
                    userId: userId,
                    amount: amount,
                    status: "SUCCESS",
                    type: "WITHDRAWAL",
                    stripeSessionId: `withdraw-${userId}-${Date.now()}`
                }
            })
        })

        return { message: "Withdraw successful!" };
    },

    async getTransactionHistory(userId: number) {
        return await prisma.transaction.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
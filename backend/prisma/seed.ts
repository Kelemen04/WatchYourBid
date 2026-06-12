import "dotenv/config";
import { prisma } from "../src/db/client";
import * as argon2 from "argon2";

async function main() {
  console.log('--- Seeding started ---');

  try {
    await prisma.$connect();
    console.log("Connection to database: OK");
  } catch (err) {
    console.error("Database error!", err);
    process.exit(1);
  }

  const adminPassword = await argon2.hash('Admin123!');

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@watchyourbid.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'VERIFIED',
      emailVerified: true,
      seller: {
        create: {
          description: "Premium watch seller (Admin)",
          rating: 5,
          address: {
            create: {
              country: "HU",
              region: "Pest",
              city: "Budapest",
              street: "Fő utca",
              number: "1",
              zipCode: "1011"
            }
          }
        }
      }
    },
  });

  console.log(`Created Super Admin account: ${adminUser.username}`);
  console.log('--- Seeding successfully finished ---');
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
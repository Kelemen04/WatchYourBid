import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AllTransactionDTO, TransactionDTO, UploadMoneyDTO } from "../dto/transaction.dto";
import api from "../api/axios";

interface UploadMoneyResponse {
    url: string; // The Stripe Checkout URL
}

interface WithdrawMoneyResponse {
    message: string;
}

// Mutations

export const useUploadMoney = () => {
  return useMutation<
      UploadMoneyResponse,
      AxiosError<{ error: string }>,
      UploadMoneyDTO
    >({
      mutationFn: async (data: UploadMoneyDTO) => {
        const response = await api.post<UploadMoneyResponse>(`/transaction/create-checkout-session`, data);
        return response.data;
      },
      onSuccess: (data) => {
        // Redirect the user to the Stripe payment page
        window.location.href = data.url;
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Money upload failed!");
      },
    });
}

export const useWithdrawMoney = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
      WithdrawMoneyResponse,
      AxiosError<{ error: string }>,
      UploadMoneyDTO
    >({
      mutationFn: async (data: UploadMoneyDTO) => {
        const response = await api.post<WithdrawMoneyResponse>(`/transaction/withdraw`, data);
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Withdraw successful: ", data.message);

        queryClient.invalidateQueries({ queryKey: ["me"] }); 
        queryClient.invalidateQueries({ queryKey: ["myTransactions"] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Withdraw failed!");
      },
    });
}

// Queries

export const useMyTransactions = (skip: number, take: number) => {
  return useQuery<TransactionDTO[], AxiosError<{ error: string }>>({
    queryKey: ["myTransactions", skip, take],
    queryFn: async () => {
      const response = await api.get<TransactionDTO[]>(`/user/transactions?skip=${skip}&take=${take}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useAllTransactions = (skip: number, take: number) => {
  return useQuery<AllTransactionDTO[], AxiosError<{ error: string }>>({
    queryKey: ["allTransactions", skip, take],
    queryFn: async () => {
      const response = await api.get<AllTransactionDTO[]>(
        `/transaction/all?skip=${skip}&take=${take}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "../api/axios";
import type { AuctionItemData } from "../dto/auction.dto";

interface MessageResponse {
    message: string;
}

export const useApproveAuction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    MessageResponse,
    AxiosError<{ error: string }>,
    number
  >({
    mutationFn: async (auctionId: number) => {
      const response = await api.patch<MessageResponse>(`/auction/${auctionId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-auctions"] });
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Approval failed!");
    },
  });
};

export const useCancelAuction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    MessageResponse,
    AxiosError<{ error: string }>,
    number
  >({
    mutationFn: async (auctionId: number) => {
      const response = await api.patch<MessageResponse>(`/auction/${auctionId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-auctions"] });
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Cancellation failed!");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<{ error: string }>,
    number
  >({
    mutationFn: async (reviewId: number) => {
      const response = await api.delete(`/review/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Review deletion failed!");
    },
  });
};

export const useGetPendingAuctions = () => {
  return useQuery<
    AuctionItemData[],
    AxiosError<{ error: string }>
  >({
    queryKey: ["pending-auctions"],
    queryFn: async () => {
      const response = await api.get<AuctionItemData[]>("/auction/pending");
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

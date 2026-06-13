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
      // Refresh the admins pending list and the public lists so the approved auction appears instantly
      queryClient.invalidateQueries({ queryKey: ["pending-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["homeAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["categoryAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["auctionsByFilters"] });
      queryClient.invalidateQueries({ queryKey: ["staff-auctions"] });
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
      // Remove the canceled auction from the pending list
      queryClient.invalidateQueries({ queryKey: ["pending-auctions"] });
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Cancellation failed!");
    },
  });
};

export const useDeleteReview = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await api.delete(`/review/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh only the specific users reviews so the delete happens instantly
      queryClient.invalidateQueries({ queryKey: ["userReviews", userId] });
    },
  });
};

export const useGetPendingAuctions = (skip: number, take: number) => {
  return useQuery<
    AuctionItemData[],
    AxiosError<{ error: string }>
  >({
    queryKey: ["pending-auctions", skip, take],
    queryFn: async () => {
      const response = await api.get<AuctionItemData[]>("/auction/pending", {
        params: {skip, take}
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};
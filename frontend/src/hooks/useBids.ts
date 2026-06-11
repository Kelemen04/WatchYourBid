import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AutoBidDTO, BidDataDTO, MyBidsDTO, PlaceBidDTO, PlacePromotingBidDTO } from "../dto/bid.dto";
import api from "../api/axios";

interface CreateBidResponse {
  bid: PlaceBidDTO;
  auctionId: number;
}

interface CreateAutoBidResponse {
  autobid: AutoBidDTO;
}

interface MessageResponse {
  message: string;
}

interface PromoteResponse {
  message: string;
}

export const useAuctionPromote = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PromoteResponse,
    AxiosError<{ error: string }>,
    { data: PlacePromotingBidDTO; auctionId: number }
  >({
    mutationFn: async ({ data, auctionId }) => {
      const response = await api.post<PromoteResponse>(`/auction/${auctionId}/promote`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    },
  });
};

export const useBidCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateBidResponse,
    AxiosError<{ error: string }>,
    { data: PlaceBidDTO; auctionId: number }
  >({
    mutationFn: async ({ data, auctionId }) => {
      const response = await api.post<CreateBidResponse>(`/auction/${auctionId}/bid`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bids", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    },
  });
};

export const useAutoBidCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAutoBidResponse,
    AxiosError<{ error: string }>,
    { data: AutoBidDTO; auctionId: number }
  >({
    mutationFn: async ({ data, auctionId }) => {
      const response = await api.post<CreateAutoBidResponse>(`/auction/${auctionId}/autobid`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bids", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    },
  });
};

export const useBuyNow = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MessageResponse,
    AxiosError<{ error: string }>,
    { auctionId: number }
  >({
    mutationFn: async ({ auctionId }) => {
      const response = await api.post<MessageResponse>(`/auction/${auctionId}/buy-now`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bids", variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    },
  });
};

export const useAuctionBids = (id: number, take: number) => {
  return useQuery<BidDataDTO[], AxiosError<{ error: string }>>({
    queryKey: ["bids", id, take],
    queryFn: async () => {
      const response = await api.get<BidDataDTO[]>(`/auction/${id}/bids`, {
        params: { take },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useMyBidsHistory = (skip: number, take: number) => {
  return useQuery<MyBidsDTO[], AxiosError<{ error: string }>>({
    queryKey: ["myBidsHistory", skip, take],
    queryFn: async () => {
      const response = await api.get<MyBidsDTO[]>(`/user/bids/me?skip=${skip}&take=${take}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};
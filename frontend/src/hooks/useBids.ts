import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AutoBidDTO, PlaceBidDTO } from "../dto/bid.dto";
import api from "../api/axios"

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


export const useBidCreate = () => {
  const queryClient = useQueryClient()

  return useMutation<
      CreateBidResponse,
      AxiosError<{ error: string }>,
      { data: PlaceBidDTO, auctionId: number }
    >({
      mutationFn: async ({data, auctionId}) => {
        console.log(data)
        const response = await api.post<CreateBidResponse>(`/auction/${auctionId}/bid`, data);
        console.log(response)
        return response.data;
      },
      onSuccess: (data, variables ) => {
        console.log("Success! Bid created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Bid creation failed!");
      },
    });
}

export const useAutoBidCreate = () => {
  const queryClient = useQueryClient()

  return useMutation<
      CreateAutoBidResponse,
      AxiosError<{ error: string }>,
      { data: AutoBidDTO, auctionId: number }
    >({
      mutationFn: async ({data, auctionId}) => {
        const response = await api.post<CreateAutoBidResponse>(`/auction/${auctionId}/autobid`, data );
        return response.data;
      },
      onSuccess: (data, variables) => {
        console.log("Success! Auto bid created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId ]});
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Auto bid creation failed!");
      },
    });
}

export const useBuyNow = () => {
  const queryClient = useQueryClient()

  return useMutation<
      MessageResponse,
      AxiosError<{ error: string }>,
      { auctionId: number }
    >({
      mutationFn: async ({ auctionId }) => {
        const response = await api.post<MessageResponse>(`/auction/${auctionId}/buy-now`);
        return response.data;
      },
      onSuccess: (data, variables) => {
        console.log("Success! Buy now method successfull: ", data.message);
        queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Buy now failed!");
      },
    });
}
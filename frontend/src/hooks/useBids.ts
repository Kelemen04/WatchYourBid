import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AutoBidDTO, PlaceBidDTO } from "../dto/bid.dto";
import api from "../api/axios"

interface CreateBidResponse {
    bid: PlaceBidDTO;
}

interface CreateAutoBidResponse {
    autobid: AutoBidDTO;
}

export const useBidCreate = () => {
  const queryClient = useQueryClient()

  return useMutation<
      CreateBidResponse,
      AxiosError<{ error: string }>,
      PlaceBidDTO
    >({
      mutationFn: async (data) => {
        console.log(data)
        const response = await api.post<CreateBidResponse>(`/auction/${data.auctionId}/bid`, data);
        console.log(response)
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Bid created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ["auction", data.bid.auctionId] });
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
      AutoBidDTO
    >({
      mutationFn: async (data) => {
        const response = await api.post<CreateAutoBidResponse>(`/auction/${data.auctionId}/autobid`, data );
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Auto bid created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ["auction", data.autobid.auctionId] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Auto bid creation failed!");
      },
    });
}
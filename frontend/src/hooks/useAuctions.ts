import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { AxiosError } from 'axios';
import type { AuctionCardData, AuctionFullData, AuctionInformtion, AuctionInput, AuctionItemData } from '../dto/auction.dto';

interface HomeAuctionsResponse {
  trending: { auction: AuctionCardData }[];
  latest: AuctionCardData[];
  smartwatches: AuctionCardData[];
  clocks: AuctionCardData[];
  wristwatches: AuctionCardData[];
  pocketWatches: AuctionCardData[];
}

interface CreateAuctionResponse {
  data: AuctionFullData;
}

export const useHomeData = () => {
  return useQuery<HomeAuctionsResponse, AxiosError<{ error: string }>>({
    queryKey: ['homeAuctions'], 
    queryFn: async () => {
      const response = await api.get<HomeAuctionsResponse>("/auction/home");
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};

export const useCategoryData = (categoryName: string) => {
  return useQuery<AuctionItemData[], AxiosError<{ error: string }>>({
    queryKey: ['categoryAuctions', categoryName], 
    queryFn: async () => {
        console.log(categoryName);
      const response = await api.get<AuctionItemData[]>(`/auction/category/${categoryName}`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};

export const useAuctionData = ( id: number) => {
  return useQuery<AuctionInformtion , AxiosError<{ error: string }>>({
    queryKey: ['categoryAuctions', id], 
    queryFn: async () => {
        console.log(id);
      const response = await api.get<AuctionInformtion>(`/auction/${id}`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};

export const useAuctionCreate = () => {
  return useMutation<
    CreateAuctionResponse,
    AxiosError<{ error: string }>,
    { auctionData: AuctionInput; images: File[] }
  >({
    mutationFn: async ({ auctionData, images }) => {
      
      const response = await api.post<CreateAuctionResponse>("/auction/", auctionData);
      
      const auctionId = response.data.data.id; 

      if (images && images.length > 0) {
        const formData = new FormData();
        images.forEach((file) => {
          formData.append("images", file);
        });

        await api.post(`/auction/${auctionId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success! Auction created successfully: ", data.data.title);
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Auction creation failed!");
    },
  });
};
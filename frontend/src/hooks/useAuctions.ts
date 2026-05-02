import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { AxiosError } from 'axios';
import type { AuctionCardData, AuctionInformtion, AuctionItemData } from '../dto/auction.dto';

interface HomeAuctionsResponse {
  trending: { auction: AuctionCardData }[];
  latest: AuctionCardData[];
  smartwatches: AuctionCardData[];
  clocks: AuctionCardData[];
  wristwatches: AuctionCardData[];
  pocketWatches: AuctionCardData[];
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
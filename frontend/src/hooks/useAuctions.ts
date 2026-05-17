import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { AxiosError } from 'axios';
import type { AuctionCardData, AuctionFullData, AuctionInformtion, AuctionInput, AuctionItemData } from '../dto/auction.dto';
import { useNavigate } from 'react-router-dom';

interface HomeAuctionsResponse {
  trending: { auction: AuctionCardData }[];
  latest: AuctionCardData[];
  smartwatches: AuctionCardData[];
  clocks: AuctionCardData[];
  wristwatches: AuctionCardData[];
  pocketWatches: AuctionCardData[];
  promoted: AuctionCardData[];
}

interface AuctionCategoryResponse {
  promoted: AuctionItemData[];
  others: AuctionItemData[]
}


interface CreateAuctionResponse {
  message: string;
  auction: AuctionFullData;
}

interface MessageResponse {
  message: string;
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

export const useWatchlist = () => {
  return useQuery<AuctionItemData[], AxiosError<{ error: string }>>({
    queryKey: ['watchlistAuctions'], 
    queryFn: async () => {
      const response = await api.get<AuctionItemData[]>("/auction/watchlist");
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};

export const useAddToWatchlist = () => {
  return useMutation<
    MessageResponse,
    AxiosError<{ error: string }>,
    { auctionId: number }
  >({
    mutationFn: async ({ auctionId }) => {
      
      const response = await api.post<MessageResponse>("/auction/watchlist", { auctionId });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success!", data.message);
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Auction adding to watchlist failed!");
    },
  });
};

export const useRemoveAuctionFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MessageResponse,
    AxiosError<{ error: string }>,
     { auctionId: number } 
  >({
    mutationFn: async ({ auctionId }) => {
      const response = await api.delete<MessageResponse>(`/auction/watchlist/${auctionId}`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success: ", data.message);     
      queryClient.invalidateQueries({ queryKey: ['watchlistAuctions'] });
    },
    onError: (err) => {
      console.error("Auction deletion from watchlist failed:", err.response?.data?.error || "Unknown error!");
    },
  });
};

export const useCategoryData = (categoryName: string) => {
  return useQuery<AuctionCategoryResponse, AxiosError<{ error: string }>>({
    queryKey: ['categoryAuctions', categoryName], 
    queryFn: async () => {
        console.log(categoryName);
      const formattedCategory = categoryName.toUpperCase();
      const response = await api.get<AuctionCategoryResponse>(`/auction/category/${formattedCategory}`);
      console.log("RESP" ,response.data);
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};

export const useAuctionData = ( id: number) => {
  return useQuery<AuctionInformtion , AxiosError<{ error: string }>>({
    queryKey: ['auctionDetails', id], 
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
  const navigate = useNavigate();
  return useMutation<
    CreateAuctionResponse,
    AxiosError<{ error: string }>,
    { auctionData: AuctionInput; images: File[] }
  >({
    mutationFn: async ({ auctionData, images }) => {
      
      const response = await api.post<CreateAuctionResponse>("/auction/", auctionData);
      
      const auctionId = response.data.auction.id; 

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
      console.log("Success! Auction created successfully: ", data.auction.title);
      navigate('/dashboard')
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Auction creation failed!");
    },
  });
};
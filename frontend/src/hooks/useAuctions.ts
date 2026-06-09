import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { AxiosError } from 'axios';
import type { AuctionCardData, AuctionFullData, AuctionInput, AuctionItemData, AuctionTableData, AuctionFilterDTO } from '../dto/auction.dto';
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
  promoted: AuctionCardData[];
  others: AuctionItemData[]
}


interface CreateAuctionResponse {
  message: string;
  auction: AuctionFullData;
}

interface MessageResponse {
  message: string;
}

export const useAuctionsByFilters = (filters: AuctionFilterDTO) => {
  return useQuery<AuctionItemData[], AxiosError<{ error: string }>>({
    queryKey: ['auctionsByFilters', filters],
    
    queryFn: async () => {
      const cleanedFilters: Record<string, string | number> = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanedFilters[key] = value as string | number;
        }
      });

      if (cleanedFilters.skip === undefined) cleanedFilters.skip = 0;
      if (cleanedFilters.take === undefined) cleanedFilters.take = 20;

      const response = await api.get<AuctionItemData[]>("/auction", {
        params: cleanedFilters,
      });
      
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });
};

export const useHomeData = () => {
  return useQuery<HomeAuctionsResponse, AxiosError<{ error: string }>>({
    queryKey: ['homeAuctions'], 
    queryFn: async () => {
      const response = await api.get<HomeAuctionsResponse>("/auction/home");
      return response.data;
    },
    refetchOnWindowFocus: false, 
    refetchInterval: 30000,
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
    refetchInterval: 30000,
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
      const formattedCategory = categoryName.toUpperCase();
      console.log(formattedCategory)
      const response = await api.get<AuctionCategoryResponse>(`/auction/category/${formattedCategory}`);
      return response.data;
    },
    refetchOnWindowFocus: false, 
    refetchInterval: 30000,
  });
};

export const useAuctionData = ( id: number) => {
  return useQuery<AuctionFullData , AxiosError<{ error: string }>>({
    queryKey: ['auctionDetails', id], 
    queryFn: async () => {
        console.log(id);
      const response = await api.get<AuctionFullData>(`/auction/${id}`);
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

export const useAuctionUpdate = (auctionId: number) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<
    CreateAuctionResponse,
    AxiosError<{ error: string }>,
    { auctionData: AuctionInput; images: File[] }
  >({
    mutationFn: async ({ auctionData, images }) => {
      
      const response = await api.put<CreateAuctionResponse>(`/auction/${auctionId}`, auctionData);
      

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
      queryClient.invalidateQueries({ queryKey: ['homeAuctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctionDetails', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['categoryAuctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctionsByUser'] });

      console.log("Success!", data.message || "Auction updated successfully!");
      navigate('/dashboard')
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Auction update failed!");
    },
  });
};

export const useAuctionDelete = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<MessageResponse, AxiosError<{ error: string }>, number>({
    mutationFn: async (auctionId: number) => {
      const response = await api.delete<MessageResponse>(`/auction/${auctionId}`);
      return response.data;
    },
    onSuccess: (data, auctionId) => {
      console.log("Auction deleted successfully:", data.message);

      queryClient.invalidateQueries({ queryKey: ['homeAuctions'] });
      queryClient.invalidateQueries({ queryKey: ['categoryAuctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctionsByUser'] });
      queryClient.invalidateQueries({ queryKey: ['auctionDetails', auctionId] });
      
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error("Auction deletion failed:", err.response?.data?.error || "Unknown error!");
    },
  });
};

export const useAuctionsByUser = () => {
  return useQuery<AuctionItemData[], AxiosError<{ error: string }>>({
    queryKey: ['auctionsByUser'], 
    queryFn: async () => {
      const response = await api.get<AuctionItemData[]>("/auction/me");
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });
};

export const useGetStaffAuctions = (skip: number = 0, take: number = 20) => {
  return useQuery<
    AuctionTableData[],
    AxiosError<{ error: string }>
  >({
    queryKey: ["staff-auctions", skip, take],
    queryFn: async () => {
      const response = await api.get<AuctionTableData[]>(`/auction/all`,{
        params: { skip, take }
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};
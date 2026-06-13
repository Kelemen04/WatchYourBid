import type { ReviewDTO, UserReviewDTO } from "../dto/review.dto";
import type { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

interface ReviewResponse {
    data: ReviewDTO;
}

export const useReviewCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ReviewResponse,
    AxiosError<{ error: string }>,
    { reviewData: ReviewDTO, auctionId: number }
  >({
    mutationFn: async ({ reviewData , auctionId }) => {
      const response = await api.post<ReviewResponse>(`/auction/${auctionId}/review`, reviewData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log("Success! Review created successfully");
      queryClient.invalidateQueries({ queryKey: ["auction", variables.auctionId] });
    },
    onError: (err) => {
      console.error(err.response?.data?.error || "Review creation failed!");
    },
  });
};

export const useUserReviews = (userId: number, skip: number = 0, take: number = 5) => {
  return useQuery<UserReviewDTO[], AxiosError<{ error: string }>>({
    queryKey: ["userReviews", userId, skip, take],
    
    queryFn: async () => {
      const response = await api.get<UserReviewDTO[]>(`/user/${userId}/reviews`, {
        params: { skip, take }
      });
      return response.data;
    },
    
    // Only fetch if a valid userId is provided
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
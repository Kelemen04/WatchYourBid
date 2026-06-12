import type { ReviewDTO, UserReviewDTO } from "../dto/review.dto";
import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../api/axios";

interface ReviewResponse {
    data: ReviewDTO;
}

export const useReviewCreate = () => {
  return useMutation<
    ReviewResponse,
    AxiosError<{ error: string }>,
    {reviewData: ReviewDTO, auctionId: number }
  >({
    mutationFn: async ({ reviewData , auctionId }) => {
      
      const response = await api.post<ReviewResponse>(`/auction/${auctionId}/review`, reviewData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success! Review created successfully: ", data);
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
    
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};
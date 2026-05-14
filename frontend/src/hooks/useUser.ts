import type { AxiosError } from "axios";
import type { BuyerRegisterDTO, MeResponse } from "../dto/user.dto";
import api from "../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface BuyerRegisterResponse {
    message: string;
    user: MeResponse; 
}

export const useBuyerRegister = () => {
  const queryClient = useQueryClient()
  return useMutation<
      BuyerRegisterResponse,
      AxiosError<{ error: string }>,
      { buyerData: BuyerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ buyerData, image}) => {
        const response = await api.post<BuyerRegisterResponse>(`/me/register-buyer`, buyerData);

        if (image) {
            const formData = new FormData();
            formData.append("image", image);


            await api.post(`/me/upload-avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Buyer account created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ['me'] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Buyer account creation failed!");
      },
    });
}

export const useMeData = () => {
  return useQuery<MeResponse, AxiosError<{ error: string }>>({ 
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get<MeResponse>(`/users/me`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false, 
    retry: false
  });
};
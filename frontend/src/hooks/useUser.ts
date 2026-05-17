import type { AxiosError } from "axios";
import type { BuyerRegisterDTO, MeResponse, SellerRegisterDTO } from "../dto/user.dto";
import api, { setAccessToken } from "../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface BuyerRegisterResponse {
    message: string;
    user: MeResponse; 
}

interface SellerRegisterResponse {
    message: string;
    user: MeResponse; 
}

interface DeleteResponse {
  message: string;
}

export const useBuyerRegister = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate();

  return useMutation<
      BuyerRegisterResponse,
      AxiosError<{ error: string }>,
      { buyerData: BuyerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ buyerData, image}) => {
        if (image) {
            const formData = new FormData();

            Object.entries(buyerData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            formData.append("image", image);

            const response = await api.post<BuyerRegisterResponse>(`/user/me/register-buyer`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        }

        const response = await api.post<BuyerRegisterResponse>(`/user/me/register-buyer`, buyerData);

        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Buyer account created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['navbar'] });
        navigate('/home');
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Buyer account creation failed!");
      },
    });
}

export const useSellerRegister = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate();

  return useMutation<
      SellerRegisterResponse,
      AxiosError<{ error: string }>,
      { sellerData: SellerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ sellerData, image}) => {

        if (image) {
            const formData = new FormData();

            Object.entries(sellerData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            formData.append("image", image);

            const response = await api.post<SellerRegisterResponse>(`/user/me/register-seller`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        }

        const response = await api.post<SellerRegisterResponse>(`/user/me/register-seller`, sellerData);

        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Seller account created successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ['me'] }); 
        queryClient.invalidateQueries({ queryKey: ['navbar'] });
        navigate('/home');
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Seller account creation failed!");
      },
    });
}

export const useMeData = () => {
  return useQuery<MeResponse, AxiosError<{ error: string }>>({ 
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get<MeResponse>(`/user/me`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false, 
    retry: false
  });
};

export const useDeleteMe = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, AxiosError<{ error: string }>, void>({
    mutationFn: async () => {
      const response = await api.delete<DeleteResponse>(`/user/me`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Account deleted successfully:", data.message);
      
      setAccessToken(null);
      
      queryClient.clear();
    },
    onError: (err) => {
      console.error("Account deletion failed:", err.response?.data?.error || "Unknown error!");
    },
  });
};
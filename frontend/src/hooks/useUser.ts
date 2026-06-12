import type { AxiosError } from "axios";
import type { AdminUserItemData, BuyerRegisterDTO, MeResponse, PublicProfileDTO, SellerRegisterDTO, UpdateRoleDTO, VerifyUserDTO } from "../dto/user.dto";
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

interface MessageResponse {
  message: string;
}

// --- REGISTER HOOKS ---

export const useBuyerRegister = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate();

  return useMutation<
      BuyerRegisterResponse,
      AxiosError<{ error: string }>,
      { buyerData: BuyerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ buyerData, image}) => {
        // 1. Lépés: Elküldjük a szöveges regisztrációs adatokat sima JSON-ként
        const response = await api.post<BuyerRegisterResponse>(`/user/me/register-buyer`, buyerData);

        // 2. Lépés: Ha van kép, azt a dedikált avatar végpontra küldjük
        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            await api.post(`/user/me/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

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
        // 1. Lépés: Szöveges adatok
        const response = await api.post<SellerRegisterResponse>(`/user/me/register-seller`, sellerData);

        // 2. Lépés: Kép feltöltése
        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            await api.post(`/user/me/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

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

// --- UPDATE HOOKS ---

export const useBuyerUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation<
      BuyerRegisterResponse,
      AxiosError<{ error: string }>,
      { buyerData: BuyerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ buyerData, image}) => {
        // 1. Lépés: Szöveges adatok frissítése (PATCH)
        const response = await api.patch<BuyerRegisterResponse>(`/user/me/update-buyer`, buyerData);

        // 2. Lépés: Új kép feltöltése (csak ha tényleg választott újat)
        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            await api.post(`/user/me/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Buyer account updated successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['navbar'] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Buyer account update failed!");
      },
    });
}

export const useSellerUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation<
      SellerRegisterResponse,
      AxiosError<{ error: string }>,
      { sellerData: SellerRegisterDTO, image?: File }
    >({
      mutationFn: async ({ sellerData, image}) => {
        // 1. Lépés: Szöveges adatok frissítése
        const response = await api.patch<SellerRegisterResponse>(`/user/me/update-seller`, sellerData);

        // 2. Lépés: Új kép feltöltése
        if (image) {
            const formData = new FormData();
            formData.append("image", image);
            await api.post(`/user/me/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Seller account updated successfully: ", data);
        queryClient.invalidateQueries({ queryKey: ['me'] }); 
        queryClient.invalidateQueries({ queryKey: ['navbar'] });
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Seller account update failed!");
      },
    });
}

export const useMeData = (options?: { enabled?: boolean }) => {
  return useQuery<MeResponse, AxiosError<{ error: string }>>({ 
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get<MeResponse>(`/user/me`);
      console.log(response);
      return response.data;
    },
    refetchOnWindowFocus: false, 
    retry: false,
    enabled: options?.enabled
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

export const usePublicProfile = (userId: number, options?: { enabled?: boolean }) => {
  return useQuery<PublicProfileDTO, AxiosError<{ error: string }>>({
    queryKey: ["publicProfile", userId],
    queryFn: async () => {
      const response = await api.get<PublicProfileDTO>(`/user/${userId}`);
      return response.data;
    },
    enabled: options?.enabled !== undefined ? (!!userId && options.enabled) : !!userId,
    refetchOnWindowFocus: false,
  });
};

export const useGetAllUsers = (skip: number = 0, take: number = 20) => {
  return useQuery<AdminUserItemData[], AxiosError<{ error: string }>>({
    queryKey: ["admin-users", skip, take],
    queryFn: async () => {
      const response = await api.get<AdminUserItemData[]>(`/user/all`, {
        params: { skip, take },
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageResponse, AxiosError<{ error: string }>, VerifyUserDTO>({
    mutationFn: async ({ userId, status }) => {
      const response = await api.patch<MessageResponse>(`/user/${userId}/verify`, { status });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success:", data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Status update failed!");
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation<MessageResponse, AxiosError<{ error: string }>, UpdateRoleDTO>({
    mutationFn: async ({ userId, newRole }) => {
      const response = await api.patch<MessageResponse>(`/user/${userId}/role`, { newRole });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Success:", data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Role update failed!");
    },
  });
};
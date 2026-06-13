import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "../api/axios";
import type { MeResponse, NavbarDTO } from "../dto/user.dto";

export const useNavbar = () => {
  return useQuery<MeResponse, AxiosError<{ error: string }>, NavbarDTO>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get<MeResponse>("/user/me");
      return response.data;
    },
    staleTime: 0,
    // Only pick the fields needed for the navbar
    select: (data) => ({
      username: data.username,
      profilePicture: data.profilePicture,
      balance: data.balance || 0 
    }),
    refetchOnWindowFocus: false,
    retry: false
  });
};
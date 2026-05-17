import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "../api/axios";
import type { NavbarDTO } from "../dto/user.dto";

export const useNavbar = () => {
  return useQuery<NavbarDTO, AxiosError<{ error: string }>>({
    queryKey: ['navbar'], 
    queryFn: async () => {
      const response = await api.get<NavbarDTO>("/user/me");
      return response.data;
    },
    refetchOnWindowFocus: false, 
  });
};
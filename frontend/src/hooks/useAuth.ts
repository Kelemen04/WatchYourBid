import { useMutation } from '@tanstack/react-query';
import axios from '../api/axios';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import type { RegisterDTO, LoginDTO } from '../dto/auth.dto';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface RegisterResponse {
  username: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  id: number;
  role: string;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const useLogin = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation<LoginResponse, AxiosError<{ error: string }>, LoginDTO>({
    mutationFn: async (data: LoginDTO) => {
      const response = await axios.post('/auth/login', data);
      return response.data;
    },
    
    onSuccess: (data) => {
      setAuth({
        user: { 
          username: data.username, 
          id: data.id, 
          role: data.role 
        },
        accessToken: data.accessToken
      });

      console.log("Login successful, global state updated!");
      
      navigate('/dashboard');
    },

    onError: (err) => {
      console.error(err.response?.data?.error || "Login failed!");
    }
  });
}

export const useLogout = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  return async () => {
    try {
      console.log("ES ITT")
      await axios.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAuth({ user: null, accessToken: null });
      navigate('/login');
    }
  };
};

export const useRegister = () => {
  return useMutation<
      RegisterResponse,
      AxiosError<{ error: string }>,
      RegisterDTO
    >({
      mutationFn: async (data: RegisterDTO) => {
        const response = await axios.post<RegisterResponse>("/auth/register", data);
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Registered user: ", data.username);
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Registration failed!");
      },
    });
};
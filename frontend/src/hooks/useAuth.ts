import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import type { RegisterDTO, LoginDTO, ForgotPasswordDTO, PasswordResetDTO } from '../dto/auth.dto';
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { setAccessToken } from '../api/axios';

interface RegisterResponse {
  username: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  id: number;
  role: string;
}

interface MessageResponse {
  message: string;
}

// Helper hook to access the global authentication state
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
      // Allows the browser to receive and send HttpOnly cookies
      const response = await api.post('/auth/login', data, { withCredentials: true});
      return response.data;
    },
    
    onSuccess: (data) => {
      // Save the token and update the global app state
      setAccessToken(data.accessToken);
      setAuth({
        user: { 
          username: data.username, 
          id: data.id, 
          role: data.role 
        },
        accessToken: data.accessToken
      });

      console.log("Login successful, global state updated!");
      navigate('/home');
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
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Delete the tokens and global state to securely log the user out
      setAccessToken(null);
      setAuth({ user: null, accessToken: null });
      navigate('/home');
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
        const response = await api.post<RegisterResponse>("/auth/register", data);
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

export const useForgotPassword = () => {
  return useMutation<
      MessageResponse,
      AxiosError<{ error: string }>,
      ForgotPasswordDTO
    >({
      mutationFn: async (data: ForgotPasswordDTO) => {
        const response = await api.post<MessageResponse>("/auth/forgot-password", data);
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Email sent for resetting password: ", data.message);
      },
      onError: (err) => {
        console.error(err.response?.data?.error || "Email sending failed for resetting password!");
      },
    });
};

export const useResetPassword = () => {
  return useMutation<
      MessageResponse,
      AxiosError<{ error: string }>,
      PasswordResetDTO
    >({
      mutationFn: async (data: PasswordResetDTO) => {
        const response = await api.post<MessageResponse>("/auth/reset-password", data);
        return response.data;
      },
      onSuccess: (data) => {
        console.log("Success! Password reset successful: ", data.message);
      },
      onError: (err) => {
        console.error("MUTATION ERROR:", err.response?.status, err.response?.data);
        console.error(err.response?.data?.error || "Password reset failed!");
      },
    });
};

export const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      // Ask the server for a new access token using the hidden refresh cookie
      const response = await api.post('/auth/refresh', {}, { withCredentials: true });
      
      const { accessToken, user } = response.data;

      // Restore the user session
      setAccessToken(accessToken);
      setAuth({
        user: user,
        accessToken: accessToken
      });

      return accessToken;
    } catch {
      // If the refresh token is expired or invalid, clear the session completely
      setAccessToken(null);
      setAuth({ user: null, accessToken: null });
      return null;
    }
  };

  return refresh;
};
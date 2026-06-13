import { createContext } from "react";

// User state and context definitions
interface AuthState {
  user: { username: string; id: number; role: string } | null;
  accessToken: string | null;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export type { AuthState, AuthContextType };
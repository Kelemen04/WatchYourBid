import { useState, type ReactNode } from "react";
import { AuthContext, type AuthState } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    accessToken: null,
  });

  const logout = () => setAuth({ user: null, accessToken: null });

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState, useEffect } from "react";
import { useRefreshToken } from "../hooks/useAuth";
import { useAuth } from "../hooks/useAuth";

// Helps the user to remain logged in across page reloads
const PersistLogin = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Silent refresh failed: ", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!auth?.accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-white text-xl">Loading session...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PersistLogin;

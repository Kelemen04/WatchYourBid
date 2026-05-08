import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import AppRouter from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider";
import PersistLogin from "./components/PersistLogin";

const queryClient = new QueryClient();

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PersistLogin>
            <AppRouter />
          </PersistLogin>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

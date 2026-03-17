import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import AppRouter from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

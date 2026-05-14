import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { io } from "socket.io-client";

export const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Success! You connected to the server, ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Connect error:", err.message);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

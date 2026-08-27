import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { io } from "socket.io-client";

// Socket.IO connection to the server
export const socket = io("http://localhost:80", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Success! You connected to the server, ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Connect error:", err.message);
});

// Renders the root application
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

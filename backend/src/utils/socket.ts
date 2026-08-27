import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

// Socket instance export
export let io: Server;

// Initialize socket server
export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost", "http://localhost:80"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
  });

  // Handle client connections
  io.on('connection', (socket) => {
    // Room management
    socket.on('joinAuction', (id) => socket.join(`auction-${id}`));
    socket.on('leaveAuction', (id) => socket.leave(`auction-${id}`));
  });

  return io;
};
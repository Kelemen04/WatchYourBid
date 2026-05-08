import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST","PUT","DELETE"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinAuction', (id) => socket.join(`auction-${id}`));
    socket.on('leaveAuction', (id) => socket.leave(`auction-${id}`));
  });

  return io;
};
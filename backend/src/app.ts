import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from "./routes/index";

import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { initSocket } from './utils/socket';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8000;
initSocket(server);

app.use(cors({
    origin: "http://localhost:8080",
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

//app.use(rateLimiter()); // Minden hivast vedunk(lehet torlom)

app.use("/api", router);

server.listen(port, () => {
    console.log(`Server listening on port - ${port}`);
});
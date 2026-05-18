import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from "./routes/index";

import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { initSocket } from './utils/socket';
import { promotingTasks } from './jobs/auction.queues';
import "./jobs/auction.workers";
import { ensureBucket } from './db/minio';

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

server.listen(port, async () => {
    console.log(`Server listening on port - ${port}`);

    await ensureBucket();

    try {
        await promotingTasks.add('daily-change', 
            { reportType: 'daily' }, 
            { repeat: { pattern: '0 0 * * *' } }
        );
        console.log("Promoted auctions refreshed");
    } catch (error) {
        console.error("Failed to refresh promoted auctions:", error);
    }
});
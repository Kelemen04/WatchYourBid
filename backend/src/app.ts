import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from "./routes/index";
import { initSocket } from './utils/socket';
import { promotingTasks } from './jobs/auction.queues';
import "./jobs/auction.workers";
import { ensureBucket } from './db/minio';

// Initialize app and server
const app = express();
const server = createServer(app);
const port = process.env.PORT || 8000;

// Set up WebSocket
initSocket(server);

// Middleware config
app.use(cors({
    origin: "http://localhost:8080",
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", router);

// Start server
server.listen(port, async () => {
    console.log(`Server listening on port - ${port}`);

    // Setup file storage
    await ensureBucket();

    // Schedule background promotion task
    try {
        await promotingTasks.add('daily-change', 
            { reportType: 'daily' }, 
            //{ repeat: { pattern: '0 0 * * *' } }
            { repeat: { pattern: '*/3 * * * *' } }
        );
        console.log("Promoted auctions refreshed");
    } catch (error) {
        console.error("Failed to refresh promoted auctions:", error);
    }
});
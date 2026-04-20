import express from 'express';
import {router} from "./routes/index";
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:8080",
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

app.listen(port, () => {
    console.log(`Server listening on port - ${port}`);
});
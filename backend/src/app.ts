import express from 'express';
import {router} from "./routes/index";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/api", router);

app.listen(port, () => {
    console.log(`Server listening on port - ${port}`);
});
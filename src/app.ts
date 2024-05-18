import express, { Express } from "express";
import client_router from "./routes/client";

export const app: Express = express();

app.use(express.json());
app.use("/client", client_router);

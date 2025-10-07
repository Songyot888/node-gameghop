import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import { router as index } from "./controller/index";
import { router as upload } from "./controller/upload";
import path from "path";

export const app = express();

app.use(
  cors({
    origin: "*", // อนุญาตทุกโดเมน
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/", index);
app.use("/upload", upload);

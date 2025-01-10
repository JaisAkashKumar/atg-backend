import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDb } from "./db/connection.js";

import authRouter from "./router/auth.js";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


app.use("/api/v1/user", authRouter);

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reset-password.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});



const port = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(port, () => console.log("Server running successfull!!y"));
  } catch (error) {
    console.log(error);
  }
};

start();

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB";
import voiceRoutes from "./routes/voiceRoutes";
import profileRoutes from "./routes/profileRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    exposedHeaders: ["X-Transcribed-Text", "X-Detected-Language", "X-UI-Action", "X-Response-Text"]
  })
);


app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", voiceRoutes);
app.use("/api", profileRoutes);

async function startServer(): Promise<void> {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();

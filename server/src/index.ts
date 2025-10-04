import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { configureAuth, googleAuthCallbackHandler, googleAuthHandler } from "./auth";
import { registerRoutes } from "./routes";
import { registerVite } from "./vite";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true, credentials: true }));
app.use(morgan("dev"));

configureAuth(app);

app.get("/api/auth/google", googleAuthHandler);
app.get("/auth/google/callback", googleAuthCallbackHandler, (_req, res) => {
  res.redirect("/");
});

// Fix: Wrap top-level await in async IIFE
(async () => {
  try {
    await registerVite(app);
  } catch (error) {
    console.error("Failed to start Vite middleware", error);
  }
})();

const distPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(distPath));

registerRoutes(app);

// Basic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = Number(process.env.PORT ?? 5000);
app.listen(port, "0.0.0.0", () => {
  console.log(`CrazyTrainAI server listening on port ${port}`);
});

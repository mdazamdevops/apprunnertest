import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary placeholder functions - replace with your actual implementations
const configureAuth = (app: express.Application) => {
  console.log("Auth configured");
};

const googleAuthHandler = (req: Request, res: Response) => {
  res.json({ message: "Google auth handler" });
};

const googleAuthCallbackHandler = (req: Request, res: Response, next: NextFunction) => {
  next();
};

const registerRoutes = (app: express.Application) => {
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      service: "server",
      timestamp: new Date().toISOString()
    });
  });
};

const registerVite = async (app: express.Application) => {
  console.log("Vite middleware registered");
};

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? true, credentials: true }));
app.use(morgan("combined")); // Changed to combined for production

configureAuth(app);

app.get("/api/auth/google", googleAuthHandler);
app.get("/auth/google/callback", googleAuthCallbackHandler, (_req, res) => {
  res.redirect("/");
});

// Safe Vite registration with error handling
try {
  await registerVite(app);
  console.log("✅ Vite middleware registered successfully");
} catch (error) {
  console.error("❌ Failed to start Vite middleware", error);
}

// Serve static files from dist/public
const distPath = path.join(__dirname, "public");
app.use(express.static(distPath));

registerRoutes(app);

// Basic error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = Number(process.env.PORT ?? 5000);
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ CrazyTrainAI server listening on port ${port}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
});

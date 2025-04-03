import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import os from "os";
import dotenv from "dotenv";
import { validateEnv } from "../shared/schema";

// Load environment variables from .env file
dotenv.config();

// Validate environment variables before starting the app
validateEnv();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to start the server with port fallback
const startServer = async (preferredPort: number) => {
  const server = createServer(app);
  const ports = [preferredPort, 3000, 8080, 0]; // 0 means any available port
  const maxRetries = ports.length;

  const registerAllRoutes = async () => {
    await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      log(`Error: ${err.message}`);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  };

  await registerAllRoutes();

  // Try each port in sequence
  for (let i = 0; i < maxRetries; i++) {
    const currentPort = ports[i];
    try {
      await new Promise<void>((resolve, reject) => {
        server.listen({ port: currentPort, host: "0.0.0.0" }, () => {
          const address = server.address();
          const actualPort = typeof address === "object" && address ? address.port : currentPort;
          log(`Server successfully started on port ${actualPort}`);

          // Log network interfaces for convenience
          const networkInterfaces = os.networkInterfaces();
          log("Available on:");
          Object.keys(networkInterfaces).forEach((interfaceName) => {
            const interfaces = networkInterfaces[interfaceName];
            interfaces?.forEach((iface) => {
              if (iface.family === "IPv4" && !iface.internal) {
                log(`  http://${iface.address}:${actualPort}`);
              }
            });
          });
          log(`  http://localhost:${actualPort}`);

          resolve();
        });

        server.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            log(`Port ${currentPort} is already in use, trying next port...`);
            server.close();
          } else {
            reject(err);
          }
        });
      });

      return;
    } catch (err) {
      const error = err as Error;
      log(`Failed to start server on port ${currentPort}: ${error.message}`);

      if (i === maxRetries - 1) {
        throw new Error(`Could not start server after trying ${maxRetries} different ports`);
      }
    }
  }
};

// Start the server
(async () => {
  try {
    const preferredPort = 5000;
    await startServer(preferredPort);
  } catch (err) {
    log(`Fatal error: ${(err as Error).message}`);
    process.exit(1);
  }
})();

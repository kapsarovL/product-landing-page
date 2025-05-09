import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  
    // Cache for the template and its last modified time
    let _templateCache: { content: string; mtimeMs: number } = { content: "", mtimeMs: 0 };
    const clientTemplate = path.resolve(
      import.meta.dirname,
      "..",
      "client",
      "index.html",
    );

    // Watch the template file for changes to update the cache
    const updateTemplateCache = async () => {
      try {
        const stats = await fs.promises.stat(clientTemplate);
        if (_templateCache.mtimeMs !== stats.mtimeMs) {
          const content = await fs.promises.readFile(clientTemplate, "utf-8");
          _templateCache = { content, mtimeMs: stats.mtimeMs };
        }
      } catch (e) {
        log(`Failed to update template cache: ${e}`, "vite");
      }
    };
    await updateTemplateCache();
    fs.watch(clientTemplate, updateTemplateCache);

    // Serve the index.html file for all routes
        app.use("*", async (req, res, next) => {
          // Sanitize the URL to prevent XSS
          const url = typeof req.originalUrl === "string"
            ? req.originalUrl.replace(/[^a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]/g, "")
            : "/";
    
          // Encode the sanitized URL to ensure safety
          const safeUrl = encodeURI(url);
    
          try {
            let template = _templateCache.content;
            template = template.replace(
              `src="/src/main.tsx"`,
              `src="/src/main.tsx?v=${nanoid()}"`,
            );
            const page = await vite.transformIndexHtml(safeUrl, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
          } catch (e) {
            vite.ssrFixStacktrace(e as Error);
            next(e);
          }
        });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

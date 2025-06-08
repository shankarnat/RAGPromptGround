import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve attached assets (PDFs, images, etc.)
app.use('/attached_assets', express.static(path.join(__dirname, '..', 'attached_assets')));

// Inline log function (no external dependencies)
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Environment-based serving
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // Production: serve static files (no vite dependencies whatsoever)
    const distPath = path.resolve(__dirname, "..", "public");
    
    app.use(express.static(distPath));
    
    // SPA fallback - serve index.html for unmatched routes
    app.use("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    
    log("Production mode: serving static files from " + distPath);
  } else {
    // Development: setup vite only in dev
    try {
      // Use dynamic import to conditionally load vite setup
      const viteModule = await import("./vite.js");
      await viteModule.setupVite(app, server);
      log("Development mode: Vite HMR enabled");
    } catch (error) {
      log("Failed to setup Vite in development: " + (error as Error).message);
      // Fallback to static serving even in development
      const distPath = path.resolve(__dirname, "..", "public");
      app.use(express.static(distPath));
      app.use("*", (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  // Use PORT from environment or default to 5175
  const port = parseInt(process.env.PORT || "5175", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on port ${port} (${isProduction ? 'production' : 'development'})`);
  });
})();
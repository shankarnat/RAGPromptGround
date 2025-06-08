import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Attached assets are served via /api/assets route in routes.ts

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
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
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
  // Register API routes first (important: before static file serving)
  const server = await registerRoutes(app);

  // Environment-based serving
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // Production: serve static files from dist/public
    const publicPath = path.resolve(__dirname, "..", "public");
    
    // Check if public directory exists
    const fs = await import("fs");
    if (!fs.existsSync(publicPath)) {
      log(`Error: Static files directory not found at ${publicPath}`);
      log("Make sure to run 'npm run build' before starting production server");
    } else {
      log(`Production mode: serving static files from ${publicPath}`);
    }
    
    // Serve static files (CSS, JS, images, etc.)
    app.use(express.static(publicPath, {
      maxAge: isProduction ? '1y' : '0', // Cache static assets in production
      etag: true
    }));
    
    // SPA fallback - MUST be last route to catch all unmatched routes
    app.use("*", (_req: Request, res: Response) => {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(500).send("index.html not found. Make sure to build the frontend first.");
      }
    });
    
  } else {
    // Development: setup vite HMR
    try {
      const viteModule = await import("./vite.js");
      await viteModule.setupVite(app, server);
      log("Development mode: Vite HMR enabled");
    } catch (error) {
      log("Warning: Failed to setup Vite in development: " + (error as Error).message);
      log("Falling back to static file serving...");
      
      // Fallback to static serving in development
      const publicPath = path.resolve(__dirname, "..", "public");
      app.use(express.static(publicPath));
      app.use("*", (_req: Request, res: Response) => {
        res.sendFile(path.resolve(publicPath, "index.html"));
      });
    }
  }

  // Error handling middleware (must be after all routes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error: ${status} - ${message}`);
    res.status(status).json({ message });
  });

  // Start server
  const port = parseInt(process.env.PORT || "5175", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`🚀 Server running on port ${port} (${isProduction ? 'production' : 'development'})`);
    if (isProduction) {
      log(`📁 Static files: http://localhost:${port}/`);
      log(`🔗 API endpoints: http://localhost:${port}/api/`);
    }
  });
})();
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import documentAnalysisRouter from "./routes/documentAnalysis";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Serve static files from attached_assets directory
  // Use import.meta.url for reliable path resolution in production
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Go up two levels: dist/server -> dist -> root -> attached_assets
  const attachedAssetsPath = path.resolve(__dirname, '..', '..', 'attached_assets');
  
  // Verify assets directory exists
  if (!fs.existsSync(attachedAssetsPath)) {
    console.warn('Warning: attached_assets directory not found at:', attachedAssetsPath);
  }
  
  app.use('/api/assets', express.static(attachedAssetsPath));

  // Document analysis routes
  app.use(documentAnalysisRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

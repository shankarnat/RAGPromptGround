import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import documentAnalysisRouter from "./routes/documentAnalysis";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Serve static files from attached_assets directory
  const attachedAssetsPath = path.join(process.cwd(), 'attached_assets');
  app.use('/api/assets', express.static(attachedAssetsPath));

  // Document analysis routes
  app.use(documentAnalysisRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

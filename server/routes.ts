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
  
  // Try multiple possible paths for attached_assets (Heroku vs local)
  const possiblePaths = [
    path.resolve(__dirname, '..', '..', 'attached_assets'), // Local: dist/server -> root/attached_assets
    path.resolve(process.cwd(), 'attached_assets'),         // Heroku: working dir/attached_assets
    path.resolve(__dirname, '..', 'attached_assets')        // Alt: dist/server -> dist/attached_assets
  ];
  
  let attachedAssetsPath = '';
  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      attachedAssetsPath = tryPath;
      console.log(`✅ Found attached_assets at: ${attachedAssetsPath}`);
      break;
    } else {
      console.log(`❌ Not found at: ${tryPath}`);
    }
  }
  
  if (!attachedAssetsPath) {
    console.error('❌ ERROR: attached_assets directory not found in any expected location!');
    console.log('Working directory:', process.cwd());
    console.log('__dirname:', __dirname);
  } else {
    // List some files for debugging
    try {
      const files = fs.readdirSync(attachedAssetsPath);
      console.log(`📁 Assets directory contains ${files.length} files:`, files.slice(0, 3));
    } catch (e) {
      console.error('Error reading assets directory:', e);
    }
  }
  
  app.use('/api/assets', express.static(attachedAssetsPath));

  // Document analysis routes
  app.use(documentAnalysisRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

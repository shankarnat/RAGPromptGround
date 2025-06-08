import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createServer } from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Simple logging
function log(message: string) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [server] ${message}`);
}

// Find attached_assets directory
let attachedAssetsPath = '';
const possiblePaths = [
  path.resolve(__dirname, '..', '..', 'attached_assets'), // Local
  path.resolve(process.cwd(), 'attached_assets'),         // Heroku
  path.resolve(__dirname, '..', 'attached_assets')        // Alt
];

for (const tryPath of possiblePaths) {
  if (fs.existsSync(tryPath)) {
    attachedAssetsPath = tryPath;
    log(`Found attached_assets at: ${attachedAssetsPath}`);
    break;
  }
}

if (!attachedAssetsPath) {
  log('WARNING: attached_assets directory not found');
  log(`Checked paths: ${possiblePaths.join(', ')}`);
}

// API routes first
app.use('/api/assets', express.static(attachedAssetsPath));

// Mock document analysis endpoint
app.post('/api/analyze-document', (req, res) => {
  res.json({
    success: true,
    analysis: { documentType: 'pdf', confidence: 0.9 },
    recommendations: []
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files for frontend
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const publicPath = path.resolve(__dirname, '..', 'public');
  
  if (fs.existsSync(publicPath)) {
    log(`Serving static files from: ${publicPath}`);
    app.use(express.static(publicPath));
    
    // SPA fallback
    app.use('*', (req, res) => {
      const indexPath = path.resolve(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Frontend not built');
      }
    });
  } else {
    log(`ERROR: Frontend not found at ${publicPath}`);
    app.use('*', (req, res) => {
      res.status(503).send('Frontend not available');
    });
  }
} else {
  log('Development mode - frontend should be served by Vite');
}

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  log(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = parseInt(process.env.PORT || '5175', 10);
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  log(`🚀 Server running on port ${port}`);
  log(`Environment: ${isProduction ? 'production' : 'development'}`);
  log(`Working directory: ${process.cwd()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});
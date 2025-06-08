import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createServer } from "http";

// Get __dirname equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Simple logging utility
function log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${timestamp} ${prefix} ${message}`);
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// ===== API ROUTES FIRST (before static file serving) =====

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Debug endpoint to list available assets
app.get('/api/debug/assets', (_req, res) => {
  try {
    if (!attachedAssetsPath || !fs.existsSync(attachedAssetsPath)) {
      return res.json({
        error: 'Assets directory not found',
        searchedPaths: [
          path.resolve(__dirname, '..', '..', 'attached_assets'),
          path.resolve(process.cwd(), 'attached_assets'),
          path.resolve(__dirname, '..', 'attached_assets'),
          path.resolve('/app', 'attached_assets')
        ],
        currentDir: process.cwd(),
        __dirname: __dirname
      });
    }

    const files = fs.readdirSync(attachedAssetsPath);
    const fileDetails = files.map(file => {
      const filePath = path.join(attachedAssetsPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        isFile: stats.isFile(),
        url: `/api/assets/${encodeURIComponent(file)}`
      };
    });

    res.json({
      assetsPath: attachedAssetsPath,
      totalFiles: files.length,
      files: fileDetails.slice(0, 10), // Show first 10 files
      acuraFile: files.find(f => f.toLowerCase().includes('acura'))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list assets',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Serve static assets from attached_assets directory → /api/assets/*
const findAttachedAssetsPath = () => {
  const possiblePaths = [
    path.resolve(__dirname, '..', '..', 'attached_assets'), // Local: dist/server -> root/attached_assets
    path.resolve(process.cwd(), 'attached_assets'),         // Heroku: /app/attached_assets
    path.resolve(__dirname, '..', 'attached_assets'),       // Alt: dist/server -> dist/attached_assets
    path.resolve('/app', 'attached_assets')                 // Heroku absolute path
  ];

  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      log(`Found attached_assets at: ${tryPath}`);
      try {
        const files = fs.readdirSync(tryPath);
        log(`Assets directory contains ${files.length} files`);
      } catch (e) {
        log(`Warning: Could not read assets directory: ${e}`, 'warn');
      }
      return tryPath;
    }
  }

  log('Warning: attached_assets directory not found in any location', 'warn');
  log(`Searched paths: ${possiblePaths.join(', ')}`, 'warn');
  return '';
};

const attachedAssetsPath = findAttachedAssetsPath();
if (attachedAssetsPath) {
  app.use('/api/assets', express.static(attachedAssetsPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true
  }));
}

// Mock document analysis endpoint (replace with your actual API logic)
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { fileName, fileSize } = req.body;
    
    // Mock response - replace with your actual document analysis logic
    const mockAnalysis = {
      documentType: fileName?.toLowerCase().includes('pdf') ? 'pdf' : 'unknown',
      structure: {
        hasTables: Math.random() > 0.5,
        hasImages: Math.random() > 0.7,
        pageCount: Math.ceil((fileSize || 1000000) / (1024 * 1024))
      },
      confidence: 0.75 + Math.random() * 0.20
    };
    
    res.json({
      success: true,
      analysis: mockAnalysis,
      recommendations: []
    });
    
  } catch (error) {
    log(`Document analysis error: ${error}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to analyze document'
    });
  }
});

// Add other API routes here...
// app.use('/api/other', otherRoutes);

// ===== STATIC FILE SERVING =====

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Production: Serve built frontend files
  const publicPath = path.resolve(__dirname, '..', 'public');
  
  // Check if frontend build exists
  if (!fs.existsSync(publicPath)) {
    log(`Error: Frontend build directory not found at ${publicPath}`, 'error');
    log('Make sure to run "npm run build" before starting the production server', 'error');
    
    // Fallback error page
    app.use('*', (_req, res) => {
      res.status(503).send(`
        <h1>Service Unavailable</h1>
        <p>Frontend not built. Run <code>npm run build</code> first.</p>
        <p>Looking for files at: ${publicPath}</p>
      `);
    });
  } else {
    log(`Serving static files from: ${publicPath}`);
    
    // Serve static files (CSS, JS, images, etc.)
    app.use(express.static(publicPath, {
      maxAge: '1y',     // Cache static assets for 1 year
      etag: true,
      lastModified: true,
      index: false      // Don't auto-serve index.html (we handle it below)
    }));
    
    // SPA fallback - serve index.html for all unmatched routes
    app.use('*', (_req, res) => {
      const indexPath = path.resolve(publicPath, 'index.html');
      
      if (fs.existsSync(indexPath)) {
        // Don't cache index.html (for SPA updates)
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`
          <h1>Not Found</h1>
          <p>Frontend index.html not found at: ${indexPath}</p>
        `);
      }
    });
  }
} else {
  // Development: Let Vite handle frontend serving
  log('Development mode detected - frontend should be served by Vite dev server');
  
  app.use('*', (_req, res) => {
    res.json({
      message: 'Development mode - use Vite dev server for frontend',
      api_health: '/api/health',
      api_assets: '/api/assets/'
    });
  });
}

// ===== ERROR HANDLING =====

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log(`Unhandled error: ${err.message}`, 'error');
  log(`Stack: ${err.stack}`, 'error');
  
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====

const port = parseInt(process.env.PORT || '5175', 10);
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  log(`🚀 Server running on port ${port}`);
  log(`Environment: ${isProduction ? 'production' : 'development'}`);
  log(`Working directory: ${process.cwd()}`);
  
  if (isProduction) {
    log(`📁 Frontend: http://localhost:${port}/`);
    log(`🔗 API: http://localhost:${port}/api/`);
    log(`📎 Assets: http://localhost:${port}/api/assets/`);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  log(`${signal} received, shutting down gracefully`);
  
  server.close(() => {
    log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    log('Force shutdown after timeout', 'error');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`, 'error');
  log(`Stack: ${err.stack}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at ${promise}: ${reason}`, 'error');
  process.exit(1);
});
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './routes/apiRouter.js';

async function startServer() {
  const app = express();
  // CAMBIO AQUÍ: Usar process.env.PORT para Azure
  const PORT = process.env.PORT || 3000;

  // Global Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Router FIRST
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Estudiantes al Centro] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
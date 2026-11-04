import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import booksRouter from './routes/books';
import advisorRouter from './routes/advisor';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import { initDb } from './db/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes - mounted both with and without /api for seamless Vercel / serverless routing
app.use('/api/books', booksRouter);
app.use('/books', booksRouter);

app.use('/api/recommend', advisorRouter);
app.use('/recommend', advisorRouter);

app.use('/api/orders', ordersRouter);
app.use('/orders', ordersRouter);

app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);

// Health check
const healthCheck = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Dar Al-Maarefa Bookstore API',
    mode: 'Perpetual Zero-Cost',
  });
};
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);

// Serve static covers from client/public/covers or client/dist/covers
const clientPublicCovers = path.resolve(__dirname, '../../client/public/covers');
const clientDistCovers = path.resolve(__dirname, '../../client/dist/covers');
if (fs.existsSync(clientPublicCovers)) {
  app.use('/covers', express.static(clientPublicCovers));
} else if (fs.existsSync(clientDistCovers)) {
  app.use('/covers', express.static(clientDistCovers));
}

// Serve frontend static assets in production (if client/dist exists)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server (only when running standalone, not in Vercel serverless)
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 Bookstore server running smoothly on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  start();
}

export default app;


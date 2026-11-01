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
app.use(express.json());

// Routes
app.use('/api/books', booksRouter);
app.use('/api/recommend', advisorRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Dar Al-Maarefa Bookstore API',
    mode: 'Perpetual Zero-Cost',
  });
});

// Serve frontend static assets in production (if client/dist exists)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server
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

start();

export default app;


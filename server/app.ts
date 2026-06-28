import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json());

// ─── Route selection: real Supabase vs. in-memory mock ───────────────────────
const USE_MOCK = process.env.USE_MOCK_DB === 'true';

if (USE_MOCK) {
  console.log('⚠️  [MOCK MODE] Using in-memory database — no Supabase connection.');
  const { default: ticketRoutes }  = await import('./routes/tickets.mock.js');
  const { default: commentRoutes } = await import('./routes/comments.mock.js');
  const { default: mockApiRoutes } = await import('./routes/mock.js');
  app.use('/api/tickets',  ticketRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/mock', mockApiRoutes);
} else {
  const { default: ticketRoutes }  = await import('./routes/tickets.js');
  const { default: commentRoutes } = await import('./routes/comments.js');
  app.use('/api/tickets',  ticketRoutes);
  app.use('/api/comments', commentRoutes);
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${USE_MOCK ? 'MOCK' : 'REAL'} DB]`)
);

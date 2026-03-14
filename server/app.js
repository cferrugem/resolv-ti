import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
import dotenv from 'dotenv';

dotenv.config();
=======
import ticketRoutes from './routes/tickets.js';
import commentRoutes from './routes/comments.js';
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a

const app = express();
app.use(cors());
app.use(express.json());
<<<<<<< HEAD

// ─── Route selection: real Supabase vs. in-memory mock ───────────────────────
const USE_MOCK = process.env.USE_MOCK_DB === 'true';

if (USE_MOCK) {
  console.log('⚠️  [MOCK MODE] Using in-memory database — no Supabase connection.');
  const { default: ticketRoutes }  = await import('./routes/tickets.mock.js');
  const { default: commentRoutes } = await import('./routes/comments.mock.js');
  app.use('/api/tickets',  ticketRoutes);
  app.use('/api/comments', commentRoutes);
} else {
  const { default: ticketRoutes }  = await import('./routes/tickets.js');
  const { default: commentRoutes } = await import('./routes/comments.js');
  app.use('/api/tickets',  ticketRoutes);
  app.use('/api/comments', commentRoutes);
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${USE_MOCK ? 'MOCK' : 'REAL'} DB]`)
);
=======
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a

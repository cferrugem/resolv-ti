import express from 'express';
import cors from 'cors';
import ticketRoutes from './routes/tickets.js';
import commentRoutes from './routes/comments.js';

const app = express();
app.use(cors());
app.use(express.json());
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
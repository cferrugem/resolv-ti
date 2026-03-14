/**
 * routes/comments.mock.js
 *
 * Mock replacement for routes/comments.js that uses the in-memory mockDb.
 *
 * Activated when USE_MOCK_DB=true in server/.env
 */

import express from 'express';
import { db, uuid, findUserById } from '../mockDb.js';

const router = express.Router();

const isValidUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

function getMockUser(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  return findUserById(auth.split(' ')[1]);
}

// ─── POST /api/comments ───────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  if (!req.body.ticket_id) return res.status(400).json({ error: 'Campo ticket_id ausente' });
  if (!isValidUUID(req.body.ticket_id)) return res.status(400).json({ error: 'Formato de ticket_id inválido' });
  if (!req.body.comment?.trim()) return res.status(400).json({ error: 'Texto do comentário é obrigatório' });

  const ticketExists = db.tickets.some(t => t.id === req.body.ticket_id);
  if (!ticketExists) return res.status(404).json({ error: 'Chamado não encontrado' });

  const comment = {
    id:         uuid(),
    ticket_id:  req.body.ticket_id,
    user_id:    user.id,
    comment:    req.body.comment.trim(),
    created_at: new Date().toISOString(),
  };

  db.ticket_comments.push(comment);
  return res.status(201).json(comment);
});

export default router;

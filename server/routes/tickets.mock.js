/**
 * routes/tickets.mock.js
 *
 * Mock replacement for routes/tickets.js that uses the in-memory mockDb
 * instead of a real Supabase database.
 *
 * Activated when USE_MOCK_DB=true in server/.env
 */

import express from 'express';
import { db, uuid, findUserById, getTicketWithRelations } from '../mockDb.js';

const router = express.Router();

// ─── Shared middleware: extract mock user from Authorization header ───────────
// In mock mode the token is the user's ID stored in the fake JWT payload.
function getMockUser(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  // Our mock token format is simply the user ID
  return findUserById(token);
}

// ─── GET /api/tickets/categories ─────────────────────────────────────────────
router.get('/categories', (_req, res) => {
  const categories = [
    { id: 'hardware',   name: 'Hardware',           description: 'Problemas com equipamentos físicos' },
    { id: 'software',   name: 'Software',            description: 'Problemas com programas e sistemas operacionais' },
    { id: 'rede',       name: 'Rede/Internet',       description: 'Problemas de conexão e rede' },
    { id: 'email',      name: 'Email/Comunicação',   description: 'Problemas com email e ferramentas de comunicação' },
    { id: 'impressora', name: 'Impressoras',         description: 'Problemas com impressoras e digitalização' },
    { id: 'seguranca',  name: 'Segurança',           description: 'Questões relacionadas à segurança digital' },
    { id: 'acesso',     name: 'Acesso/Contas',       description: 'Problemas com senhas e permissões' },
    { id: 'sistemas',   name: 'Sistemas Internos',   description: 'Problemas com sistemas da empresa' },
    { id: 'aplicacao',  name: 'Erro de Aplicação',   description: 'Erros em aplicativos específicos' },
    { id: 'outro',      name: 'Outros',              description: 'Outros problemas não listados' },
  ];
  return res.status(200).json(categories);
});

// ─── POST /api/tickets ────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  const { title, description, priority, category } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Prioridade inválida' });
  }

  const now = new Date().toISOString();
  const ticket = {
    id:          uuid(),
    title,
    description,
    priority:    priority  || 'medium',
    category:    category  || 'outro',
    status:      'open',
    user_id:     user.id,
    assigned_to: null,
    created_at:  now,
    updated_at:  now,
  };

  db.tickets.push(ticket);
  return res.status(201).json(ticket);
});

// ─── PUT /api/tickets/:id ─────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });
  if (user.role !== 'staff') return res.status(403).json({ error: 'Apenas staff pode atualizar chamados' });

  const ticketIndex = db.tickets.findIndex(t => t.id === req.params.id);
  if (ticketIndex === -1) return res.status(404).json({ error: 'Chamado não encontrado' });

  const updateData = {};
  if (req.body.status)               updateData.status      = req.body.status;
  if ('assigned_to' in req.body)     updateData.assigned_to = req.body.assigned_to;
  updateData.updated_at = new Date().toISOString();

  db.tickets[ticketIndex] = { ...db.tickets[ticketIndex], ...updateData };
  return res.status(200).json(db.tickets[ticketIndex]);
});

export default router;

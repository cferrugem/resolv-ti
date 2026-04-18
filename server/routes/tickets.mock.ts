/**
 * routes/tickets.mock.ts
 *
 * Mock replacement for routes/tickets.js that uses the in-memory mockDb
 * instead of a real Supabase database.
 *
 * Activated when USE_MOCK_DB=true in server/.env
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

async function getMockUser(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  return await prisma.user.findUnique({ where: { id: token } });
}

// ─── GET /api/tickets/categories ─────────────────────────────────────────────
router.get('/categories', (_req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  const { title, description, priority, category } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Prioridade inválida' });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      priority: priority || 'medium',
      category: category || 'outro',
      status: 'open',
      user_id: user.id,
      assigned_to: null,
    }
  });

  return res.status(201).json(ticket);
});

// ─── PUT /api/tickets/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });
  if (user.role !== 'staff') return res.status(403).json({ error: 'Apenas staff pode atualizar chamados' });

  const ticketId = req.params.id as string;
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

  const updateData: any = {};
  
  if (req.body.status) {
    const validStatuses = ['open', 'in progress', 'closed'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    updateData.status = req.body.status;
  }
  
  if ('assigned_to' in req.body) {
    updateData.assigned_to = req.body.assigned_to;
  }
  
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: updateData
  });

  return res.status(200).json(updatedTicket);
});

export default router;

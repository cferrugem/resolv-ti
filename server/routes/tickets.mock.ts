/**
 * routes/tickets.mock.ts
 *
 * Mock replacement for routes/tickets.js that uses the in-memory mockDb
 * instead of a real Supabase database.
 *
 * Activated when USE_MOCK_DB=true in server/.env
 */

import express, { Request, Response } from 'express';
import { prisma } from '../db.js';

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
  // Categories are static — safe to cache in the browser for 24 hours
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).json(categories);
});

// ─── GET /api/tickets/stats ───────────────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user || user.role !== 'staff') {
    return res.status(403).json({ error: 'Acesso negado: apenas staff pode ver estatísticas' });
  }

  const timeFrame = (req.query.timeFrame as string) || 'week';
  const now = new Date();
  let startDate = new Date();
  
  switch(timeFrame) {
    case 'week': startDate.setDate(now.getDate() - 7); break;
    case 'month': startDate.setMonth(now.getMonth() - 1); break;
    case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
    default: startDate.setDate(now.getDate() - 7);
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      created_at: { gte: startDate }
    },
    include: {
      user: true,
      assigned_staff: true,
      comments: true
    }
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    urgent: tickets.filter(t => t.priority === 'high').length,
    byCategory: {} as Record<string, number>,
    trends: {} as Record<string, number>,
    topUsers: {} as Record<string, number>,
    staffPerformance: {} as Record<string, { assigned: number, closed: number }>
  };

  tickets.forEach(t => {
    const cat = t.category || 'outro';
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

    const date = t.created_at.toISOString().split('T')[0];
    stats.trends[date] = (stats.trends[date] || 0) + 1;

    const email = t.user?.email || 'Desconhecido';
    stats.topUsers[email] = (stats.topUsers[email] || 0) + 1;

    if (t.assigned_to) {
      const staffEmail = t.assigned_staff?.email || 'Desconhecido';
      if (!stats.staffPerformance[staffEmail]) {
        stats.staffPerformance[staffEmail] = { assigned: 0, closed: 0 };
      }
      stats.staffPerformance[staffEmail].assigned++;
      if (t.status === 'closed') stats.staffPerformance[staffEmail].closed++;
    }
  });

  return res.status(200).json(stats);
});

// ─── GET /api/tickets ────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  const where = user.role === 'staff' ? {} : { user_id: user.id };
  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      user: { select: { id: true, email: true } },
      assigned_staff: { select: { id: true, email: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  return res.status(200).json(tickets);
});

// ─── GET /api/tickets/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, role: true } },
      assigned_staff: { select: { id: true, email: true, role: true } }
    }
  });

  if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

  // Verificação básica de propriedade
  if (user.role !== 'staff' && ticket.user_id !== user.id) {
    return res.status(403).json({ error: 'Acesso negado a este chamado' });
  }

  return res.status(200).json(ticket);
});

// ─── GET /api/tickets/:id/comments ───────────────────────────────────────────
router.get('/:id/comments', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

  if (user.role !== 'staff' && ticket.user_id !== user.id) {
    return res.status(403).json({ error: 'Acesso negado aos comentários deste chamado' });
  }

  const comments = await prisma.comment.findMany({
    where: { ticket_id: req.params.id },
    include: {
      user: { select: { id: true, email: true, role: true } }
    },
    orderBy: { created_at: 'asc' }
  });

  return res.status(200).json(comments);
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

// ─── DELETE /api/tickets/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });
  if (user.role !== 'staff') return res.status(403).json({ error: 'Apenas staff pode deletar chamados' });

  const ticketId = req.params.id as string;
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

  await prisma.comment.deleteMany({ where: { ticket_id: ticketId } });
  await prisma.ticket.delete({ where: { id: ticketId } });

  return res.status(204).send();
});

export default router;

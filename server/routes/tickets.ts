import express, { Response } from 'express';
import { supabase } from '../supabaseClient.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { verifyTicketOwnership } from '../middleware/ownership.js';
import { CreateTicketSchema, UpdateTicketSchema } from '../schemas/ticket.schema.js';
import { ZodError } from 'zod';

const router = express.Router();

// Endpoint para listar categorias disponíveis
router.get('/categories', async (_req: AuthRequest, res: Response) => {
  try {
    const categories = [
      { id: 'hardware', name: 'Hardware', description: 'Problemas com equipamentos físicos' },
      { id: 'software', name: 'Software', description: 'Problemas com programas e sistemas operacionais' },
      { id: 'rede', name: 'Rede/Internet', description: 'Problemas de conexão e rede' },
      { id: 'email', name: 'Email/Comunicação', description: 'Problemas com email e ferramentas de comunicação' },
      { id: 'impressora', name: 'Impressoras', description: 'Problemas com impressoras e digitalização' },
      { id: 'seguranca', name: 'Segurança', description: 'Questões relacionadas à segurança digital' },
      { id: 'acesso', name: 'Acesso/Contas', description: 'Problemas com senhas e permissões' },
      { id: 'sistemas', name: 'Sistemas Internos', description: 'Problemas com sistemas da empresa' },
      { id: 'aplicacao', name: 'Erro de Aplicação', description: 'Erros em aplicativos específicos' },
      { id: 'outro', name: 'Outros', description: 'Outros problemas não listados' }
    ];
    
    // Categories are static — safe to cache in the browser for 24 hours
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Statistics (Staff only)
router.get('/stats', authenticate, authorize(['staff']), async (req: AuthRequest, res: Response) => {
  try {
    const timeFrame = (req.query.timeFrame as string) || 'week';
    const now = new Date();
    let startDate = new Date();
    
    switch(timeFrame) {
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
      default: startDate.setDate(now.getDate() - 7);
    }

    // Select only the columns needed for stats — avoids fetching description,
    // title, and other large fields that are unused in this computation.
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id, status, priority, category, created_at, assigned_to,
        user:user_id (email),
        assigned_staff:assigned_to (email)
      `)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate metrics server-side
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
      // Category stats
      const cat = t.category || 'outro';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

      // Trends
      const date = t.created_at.split('T')[0];
      stats.trends[date] = (stats.trends[date] || 0) + 1;

      // Top Users
      const email = t.user?.email || 'Desconhecido';
      stats.topUsers[email] = (stats.topUsers[email] || 0) + 1;

      // Staff Performance
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
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Listar tickets (com filtro por papel)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        user:user_id (id, email),
        assigned_staff:assigned_to (id, email)
      `)
      .order('created_at', { ascending: false });

    // Se não for staff, filtrar apenas os próprios tickets
    if (req.role !== 'staff') {
      query = query.eq('user_id', req.user!.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Erro ao listar tickets:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Obter um único ticket
router.get('/:id', authenticate, verifyTicketOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        user:user_id (id, email, role),
        assigned_staff:assigned_to (id, email, role)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Ticket not found' });

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Erro ao buscar ticket:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Obter comentários de um ticket
router.get('/:id/comments', authenticate, verifyTicketOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        user:user_id (id, email, role)
      `)
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Erro ao buscar comentários:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Criar ticket
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = CreateTicketSchema.parse(req.body);
    const user = req.user!;

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...validatedData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(data);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error('Erro ao criar ticket:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Atualizar ticket
router.put('/:id', authenticate, verifyTicketOwnership, async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    
    // Only staff can update status or assignment via this route in a typical BFF
    // But for now, we follow the existing schema and ownership
    const validatedData = UpdateTicketSchema.parse(req.body);

    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    console.error('Erro ao atualizar ticket:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Deletar ticket
router.delete('/:id', authenticate, authorize(['staff']), async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.status(204).send();
  } catch (err: any) {
    console.error('Erro ao deletar ticket:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;

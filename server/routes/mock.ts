import express, { Request, Response } from 'express';
import { prisma } from '../db.js';
const router = express.Router();

router.post('/query', async (req: Request, res: Response) => {
  try {
    const { _table, _filters, _order, _op, _payload, _single } = req.body;

    let model: any;
    if (_table === 'tickets') model = prisma.ticket;
    else if (_table === 'users') model = prisma.user;
    else if (_table === 'ticket_comments') model = prisma.comment;
    else return res.status(400).json({ error: { message: `Table ${_table} not supported` } });

    // Build Prisma Where
    const where: any = {};
    for (const f of _filters || []) {
      if (f.type === 'eq') where[f.col] = f.val;
      if (f.type === 'in') where[f.col] = { in: f.vals };
      if (f.type === 'gte') where[f.col] = { gte: f.val };
      if (f.type === 'lte') where[f.col] = { lte: f.val };
    }

    // Build Prisma OrderBy
    let orderBy: any = undefined;
    if (_order) {
      orderBy = { [_order.col]: _order.asc ? 'asc' : 'desc' };
    }

    if (_op === 'select') {
      let data;
      const include = _table === 'tickets' ? { user: true, assigned_staff: true, comments: true } : undefined;
      
      if (_single) {
        data = await model.findFirst({ where, orderBy, include });
        if (!data) return res.json({ data: null, error: { message: 'Nenhum registro encontrado', code: 'PGRST116' } });
      } else {
        data = await model.findMany({ where, orderBy, include });
      }

      // Map relations for tickets
      if (_table === 'tickets' && data) {
        const mapTicket = (t: any) => ({
          ...t,
          created_at: t.created_at.toISOString(),
          updated_at: t.updated_at.toISOString(),
          assigned_to_user: t.assigned_staff ? { id: t.assigned_staff.id } : null,
          ticket_comments: t.comments.map((c: any) => ({ ...c, created_at: c.created_at.toISOString() })),
        });
        if (Array.isArray(data)) data = data.map(mapTicket);
        else data = mapTicket(data);
      }

      return res.json({ data, error: null });
    }

    if (_op === 'insert') {
      const items = Array.isArray(_payload) ? _payload : [_payload];
      const inserted = [];
      for (const item of items) {
        inserted.push(await model.create({ data: item }));
      }
      return res.json({ data: _single ? inserted[0] : inserted, error: null });
    }

    if (_op === 'update') {
      // Prisma updateMany doesn't return the updated records, only count.
      // We will do findMany, then update each.
      const toUpdate = await model.findMany({ where });
      for (const record of toUpdate) {
        await model.update({ where: { id: record.id }, data: _payload });
      }
      const updated = await model.findMany({ where });
      return res.json({ data: _single ? updated[0] : updated, error: null });
    }

    if (_op === 'delete') {
      const toDelete = await model.findMany({ where });
      await model.deleteMany({ where });
      return res.json({ data: toDelete, error: null });
    }

    return res.status(400).json({ error: { message: 'Operação desconhecida' } });
  } catch (err: any) {
    console.error('Mock DB error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
});

// RPC endpoint
router.post('/rpc/:fnName', async (req: Request, res: Response) => {
  const { fnName } = req.params;
  const { params, session } = req.body;

  if (fnName === 'create_ticket_comment') {
    if (!session) return res.json({ data: null, error: { message: 'Não autenticado' } });
    const comment = await prisma.comment.create({
      data: {
        ticket_id: params.p_ticket_id,
        user_id: session.user.id,
        comment: params.p_comment_text,
      }
    });
    return res.json({ data: comment.id, error: null });
  }

  return res.json({ data: null, error: { message: `RPC "${fnName}" não implementada no mock` } });
});

// Auth endpoints
router.post('/auth/signIn', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.json({ data: { user: null, session: null }, error: { message: 'E-mail ou senha incorretos' } });
  }
  const session = { access_token: user.id, user: { id: user.id, email: user.email } };
  return res.json({ data: { user: { id: user.id, email: user.email }, session }, error: null });
});

router.post('/auth/signUp', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.json({ data: { user: null }, error: { message: 'E-mail já cadastrado' } });
  }
  const user = await prisma.user.create({ data: { email, password, role: 'customer' } });
  const session = { access_token: user.id, user: { id: user.id, email: user.email } };
  return res.json({ data: { user: { id: user.id, email: user.email }, session }, error: null });
});

router.post('/auth/getUser', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.json({ data: { user: null }, error: { message: 'Token inválido' } });
  const user = await prisma.user.findUnique({ where: { id: token } });
  if (!user) return res.json({ data: { user: null }, error: { message: 'Token inválido' } });
  return res.json({ data: { user: { id: user.id, email: user.email } }, error: null });
});

export default router;

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({ url: 'file:./dev.db' });
const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const router = express.Router();

async function getMockUser(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  return await prisma.user.findUnique({ where: { id: token } });
}

router.post('/', async (req: Request, res: Response) => {
  const user = await getMockUser(req);
  if (!user) return res.status(401).json({ error: 'Token de autorização ausente ou inválido' });

  if (!req.body.ticket_id) {
    return res.status(400).json({ error: 'Missing ticket_id field' });
  }

  if (!req.body.comment || !req.body.comment.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const comment = await prisma.comment.create({
    data: {
      ticket_id: req.body.ticket_id,
      user_id: user.id,
      comment: req.body.comment.trim(),
    }
  });

  return res.status(201).json(comment);
});

export default router;

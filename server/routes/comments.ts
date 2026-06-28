import express, { Response } from 'express';
import { supabase } from '../supabaseClient.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { z, ZodError } from 'zod';

const router = express.Router();

const CreateCommentSchema = z.object({
  ticket_id: z.string().uuid(),
  comment: z.string().min(1).max(1000),
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ticket_id, comment } = CreateCommentSchema.parse(req.body);
    const user = req.user!;

    const commentData = {
      ticket_id,
      user_id: user.id,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ticket_comments')
      .insert([commentData])
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
    console.error('Erro ao criar comentário:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;

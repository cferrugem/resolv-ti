import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Helper function to validate UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Create a new Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Use the token to get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Validate request body
    if (!req.body.ticket_id) {
      return res.status(400).json({ error: 'Missing ticket_id field' });
    }
    
    if (!isValidUUID(req.body.ticket_id)) {
      return res.status(400).json({ error: 'Invalid ticket_id format' });
    }
    
    if (!req.body.comment || !req.body.comment.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const commentData = {
      ticket_id: req.body.ticket_id,
      user_id: user.id,
      comment: req.body.comment.trim(),
      created_at: new Date().toISOString()
    };

    // Use the client with proper authentication
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert([commentData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;

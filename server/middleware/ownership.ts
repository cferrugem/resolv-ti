import { Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient.js';
import { AuthRequest } from './auth.js';

/**
 * Middleware to verify that the authenticated user owns the ticket they are trying to access.
 * Staff members bypass this check.
 */
export const verifyTicketOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const role = req.role;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Staff bypass ownership check
    if (role === 'staff') {
      return next();
    }

    // Check if the ticket belongs to the user
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied: You do not own this ticket' });
    }

    next();
  } catch (err) {
    console.error('Ownership middleware error:', err);
    res.status(500).json({ error: 'Internal server error during ownership verification' });
  }
};

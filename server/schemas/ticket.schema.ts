import { z } from 'zod';

export const CreateTicketSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  category: z.string().optional().default('outro'),
});

export const UpdateTicketSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  status: z.enum(['open', 'in progress', 'closed']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Endpoint para listar categorias disponíveis
router.get('/categories', async (req, res) => {
  try {
    // Categorias predefinidas para suporte de TI
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
    
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Modifique a rota POST para incluir categoria

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Create a new Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify user with token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const { title, description, priority, category } = req.body;
    
    // Validação básica
    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    // Validar prioridade
    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Prioridade inválida' });
    }

    // Criar ticket com a categoria
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        category: category || 'outro', // Incluir categoria
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro no banco de dados:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Erro do servidor:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update the PUT handler to handle errors better

router.put('/:id', async (req, res) => {
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

    // Check if user is staff
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    if (userData.role !== 'staff') {
      return res.status(403).json({ error: 'Only staff members can update tickets' });
    }

    // Validate ticket ID
    const ticketId = req.params.id;
    if (!ticketId) {
      return res.status(400).json({ error: 'Missing ticket ID' });
    }

    // Create update object with only valid fields
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if ('assigned_to' in req.body) updateData.assigned_to = req.body.assigned_to;
    updateData.updated_at = new Date().toISOString();

    // Update ticket
    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
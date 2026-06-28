import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

// Helper to get auth header
const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets`, {
        headers: { ...authHeader }
      });
      if (!response.ok) throw new Error('Falha ao buscar chamados');
      return response.json();
    },
    staleTime: 30 * 1000, // tickets refresh after 30 seconds
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        headers: { ...authHeader }
      });
      if (!response.ok) throw new Error('Falha ao buscar detalhes do chamado');
      return response.json();
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useTicketComments(id) {
  return useQuery({
    queryKey: ['tickets', id, 'comments'],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets/${id}/comments`, {
        headers: { ...authHeader }
      });
      if (!response.ok) throw new Error('Falha ao buscar comentários');
      return response.json();
    },
    enabled: !!id,
    staleTime: 15 * 1000, // comments are more dynamic, refresh every 15s
  });
}

export function useDashboardStats(timeFrame = 'week') {
  return useQuery({
    queryKey: ['dashboard-stats', timeFrame],
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets/stats?timeFrame=${timeFrame}`, {
        headers: { ...authHeader }
      });
      if (!response.ok) throw new Error('Falha ao buscar estatísticas');
      return response.json();
    },
    staleTime: 60 * 1000,      // stats stay fresh for 1 minute
    refetchInterval: 60 * 1000, // background refresh every minute
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/tickets/categories`);
      if (!response.ok) throw new Error('Falha ao carregar categorias');
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // categories are static — cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('role', 'staff');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // staff list changes rarely — cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar chamado');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticket_id, comment }) => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ ticket_id, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar comentário');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.ticket_id, 'comments'] });
    },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData) => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar chamado');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const authHeader = await getAuthHeader();
      const response = await fetch(`${API_URL}/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar chamado');
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

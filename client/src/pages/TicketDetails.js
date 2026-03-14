import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Data desconhecida';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({});
  const { user, role } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const commentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTicketData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch ticket details with user information
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select(`
            *,
            user:user_id (id, email, role),
            assigned_staff:assigned_to (id, email, role)
          `)
          .eq('id', id)
          .single();
        
        if (ticketError) throw ticketError;
        setTicket(ticketData);
        
        // Fetch comments with user information
        const { data: commentData, error: commentError } = await supabase
          .from('ticket_comments')
          .select('*') // Ensure user_id is selected
          .eq('ticket_id', id)
          .order('created_at', { ascending: true });
        
        if (commentError) throw commentError;
        setComments(commentData || []);
        
        // Get all unique user IDs from comments
        const userIds = [...new Set((commentData || []).map(comment => comment.user_id))];
        
        // Filter out null or undefined user IDs
        const validUserIds = userIds.filter(uid => uid != null); // Use != null to catch both null and undefined

        // Fetch user data for all valid comment authors
        if (validUserIds.length > 0) { // Only query if there are valid IDs
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, email')
            .in('id', validUserIds); // Use the filtered array
          
          if (userError) {
             // Log the specific error from Supabase
             console.error('Error fetching user data for comments:', userError);
             throw userError; // Re-throw the error
          }
          
          const userMap = {};
          for (const u of userData) {
            userMap[u.id] = u;
          }
          
          setUsers(userMap);
        } else {
          // If there are no valid user IDs (e.g., all comments have null user_id), set users to empty object
          setUsers({});
        }
      } catch (err) {
        // Log the caught error, which might be the userError from above
        console.error('Error fetching ticket data:', err); 
        setError(err.message || 'Failed to load ticket details.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTicketData();
  }, [id]);

  // Adicione um efeito para buscar as categorias
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/tickets/categories');
        if (!response.ok) throw new Error('Falha ao carregar categorias');
        const data = await response.json();
        if (isMounted) setCategories(data);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    }
    
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Encontrar o nome da categoria pelo ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Update the handleAddComment function
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      // Check that id is a valid UUID
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid ticket ID');
      }
      
      // Make sure user is authenticated with a valid ID
      if (!user || !user.id) {
        throw new Error('User authentication required');
      }
      
      // Try to use Supabase RPC function to handle comment creation with proper auth
      const { data: commentData, error: rpcError } = await supabase.rpc('create_ticket_comment', {
        p_ticket_id: id,
        p_comment_text: newComment.trim()
      });
      
      if (rpcError) {
        console.log('RPC failed, trying direct insert...');
        // Fall back to direct insert
        const { error: commentError } = await supabase
          .from('ticket_comments')
          .insert({
            ticket_id: id,
            comment: newComment.trim()
          });
        
        if (commentError) {
          throw new Error(commentError.message);
        }
      }

      // Refresh comments after successful addition
      const { data: refreshedComments, error: refreshError } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
      
      if (refreshError) throw refreshError;
      setComments(refreshedComments || []);
      setNewComment('');
      
      // Scroll to the new comment
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(`Failed to add comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete all comments
      const { error: commentsError } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('ticket_id', ticket.id);

      if (commentsError) throw commentsError;

      // Then delete the ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticket.id);

      if (ticketError) throw ticketError;

      // Redirect to tickets list
      navigate('/tickets');
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Failed to delete ticket: ' + err.message);
    }
  };

  return (
    <PageContainer title="Detalhes do Chamado">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
<<<<<<< HEAD
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50/80 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl backdrop-blur-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
=======
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
<<<<<<< HEAD
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
=======
              <p className="text-sm text-red-700">{error}</p>
              <p className="mt-2 text-sm">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                Por favor, tente novamente ou contate o suporte.
              </p>
            </div>
          </div>
        </div>
      ) : !ticket ? (
        <div className="text-center py-12">
<<<<<<< HEAD
          <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-200">Chamado não encontrado</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O chamado solicitado não existe ou foi removido.</p>
          <div className="mt-6">
            <Link 
              to={role === 'staff' ? "/tickets" : "/my-tickets"} 
              className="btn-primary text-sm"
=======
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chamado não encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">O chamado solicitado não existe ou foi removido.</p>
          <div className="mt-6">
            <Link 
              to={role === 'staff' ? "/tickets" : "/my-tickets"} 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
            >
              {role === 'staff' ? 'Voltar para Lista de Chamados' : 'Voltar para Meus Chamados'}
            </Link>
          </div>
        </div>
      ) : (
<<<<<<< HEAD
        <div className="space-y-6">
          {/* Ticket Header */}
          <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{ticket.title}</h2>
                  <span className="text-sm text-slate-400 dark:text-slate-500 font-mono">#{typeof ticket.id === 'string' ? ticket.id.substring(0, 8) : String(ticket.id).substring(0, 8)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    ticket.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50' :
                    ticket.status === 'in progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50'
=======
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          {/* Cabeçalho do chamado */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <h2 className="text-2xl font-bold text-gray-900 mr-2">{ticket.title}</h2>
                  <span className="text-sm text-gray-500">#{typeof ticket.id === 'string' ? ticket.id.substring(0, 8) : String(ticket.id).substring(0, 8)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    ticket.status === 'in progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-green-100 text-green-800 border border-green-200'
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                  }`}>
                    {ticket.status === 'open' && (
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {ticket.status === 'in progress' && (
<<<<<<< HEAD
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
=======
                      <svg className="w-3 h-3 mr-1.5 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3.5a1.5 1.5 0 013 0V5a1 1 0 01-2 0V3.5zM10 15a1.5 1.5 0 013 0v1.5a1 1 0 11-2 0V15zm-5-1.5a1.5 1.5 0 000 3H6a1 1 0 100-2H5zm11.5 0a1.5 1.5 0 000 3H18a1 1 0 100-2h-1.5zM5 6.5a1.5 1.5 0 01-3 0V5a1 1 0 012 0v1.5zm0 8a1.5 1.5 0 01-3 0v-1.5a1 1 0 112 0V15zm13-7a1.5 1.5 0 00-3 0V6a1 1 0 01-2 0V4.5a1.5 1.5 0 013 0V6a1 1 0 11-2 0V4.5zM18 7.5a1.5 1.5 0 00-3 0V9a1 1 0 11-2 0V7.5a1.5 1.5 0 113 0V9a1 1 0 11-2 0V7.5z" />
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                      </svg>
                    )}
                    {ticket.status === 'closed' && (
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {ticket.status === 'open' ? 'Aberto' : 
                     ticket.status === 'in progress' ? 'Em Andamento' : 'Fechado'}
                  </span>
<<<<<<< HEAD
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    ticket.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50' :
                    ticket.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50'
                  }`}>
                    <span className={`mr-1.5 h-2 w-2 rounded-full ${
                      ticket.priority === 'high' ? 'bg-red-500' :
                      ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
=======
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    <span className={`mr-1.5 h-2.5 w-2.5 rounded-full ${
                      ticket.priority === 'high' ? 'bg-red-500' :
                      ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    }`}></span>
                    Prioridade: {ticket.priority === 'high' ? 'Alta' : 
                                 ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
<<<<<<< HEAD
                  <span className="text-sm text-slate-500 dark:text-slate-400">
=======
                  <span className="text-sm text-gray-500">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    Criado em {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>
              
              {role === 'staff' && (
                <div className="flex mt-4 md:mt-0">
                  <button
                    onClick={handleDeleteTicket}
<<<<<<< HEAD
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-xl text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900 transition-colors"
=======
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                  >
                    <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir Chamado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid de informações e descrição */}
<<<<<<< HEAD
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Coluna principal - Descrição e comentários */}
            <div className="lg:col-span-3 space-y-6">
              {/* Description */}
              <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                  <svg className="mr-2 h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descrição
                </h3>
                <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{ticket.description}</p>
=======
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-6">
            {/* Coluna principal - Descrição e comentários */}
            <div className="lg:col-span-3 px-6 py-6">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Descrição</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-line">{ticket.description}</p>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                </div>
              </div>
              
              {/* Seção de comentários */}
<<<<<<< HEAD
              <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                  <svg className="mr-2 h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
=======
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Comentários
                  {comments.length > 0 && (
<<<<<<< HEAD
                    <span className="ml-2 text-sm bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 py-0.5 px-2.5 rounded-full font-medium">
=======
                    <span className="ml-2 text-sm bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                      {comments.length}
                    </span>
                  )}
                </h3>
                
                {comments.length === 0 ? (
<<<<<<< HEAD
                  <div className="text-center py-8 bg-white/40 dark:bg-slate-800/30 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
                    <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nenhum comentário ainda.</p>
=======
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Nenhum comentário ainda.</p>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="space-y-4">
                      {comments.map((comment, index) => (
<<<<<<< HEAD
                        <li key={comment.id} className={`bg-white/60 dark:bg-slate-800/40 rounded-xl p-4 border ${
                          users[comment.user_id]?.role === 'staff' 
                            ? 'border-primary-200/60 dark:border-primary-700/40' 
                            : 'border-slate-200/40 dark:border-slate-700/30'
                        } transition-colors`}>
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                                users[comment.user_id]?.role === 'staff' 
                                ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
=======
                        <li key={comment.id} className={`bg-gray-50 rounded-lg p-4 border ${
                          users[comment.user_id]?.role === 'staff' 
                            ? 'border-blue-200' 
                            : 'border-gray-200'
                        }`}>
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                users[comment.user_id]?.role === 'staff' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-700'
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                              }`}>
                                {users[comment.user_id]?.role === 'staff' ? 'S' : 'U'}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center mb-1">
<<<<<<< HEAD
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                  {users[comment.user_id]?.email || 'Usuário desconhecido'}
                                  <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    users[comment.user_id]?.role === 'staff' 
                                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400'
=======
                                <p className="text-sm font-medium text-gray-900">
                                  {users[comment.user_id]?.email || 'Usuário desconhecido'}
                                  <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    users[comment.user_id]?.role === 'staff' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-800'
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                                  }`}>
                                    {users[comment.user_id]?.role === 'staff' ? 'Suporte' : 'Cliente'}
                                  </span>
                                </p>
<<<<<<< HEAD
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line border-l-2 border-slate-200 dark:border-slate-600 pl-3 leading-relaxed">
=======
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-700 whitespace-pre-line border-l-2 border-gray-200 pl-3">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                                {comment.comment}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Formulário para adicionar comentário */}
<<<<<<< HEAD
                <div className="mt-6 bg-white/60 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200/40 dark:border-slate-700/30" ref={commentRef}>
                  <form onSubmit={handleAddComment}>
                    <div className="mb-3">
                      <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Adicionar um comentário</label>
=======
                <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200" ref={commentRef}>
                  <form onSubmit={handleAddComment}>
                    <div className="mb-3">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Adicionar um comentário</label>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                      <textarea
                        id="comment"
                        name="comment"
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
<<<<<<< HEAD
                        className="block w-full px-4 py-3 rounded-xl form-input-dark sm:text-sm"
=======
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                        placeholder="Digite seu comentário aqui..."
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
<<<<<<< HEAD
                        className="btn-primary text-sm"
=======
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </>
                        ) : (
                          'Enviar Comentário'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Coluna lateral - Informações do ticket */}
<<<<<<< HEAD
            <div className="lg:col-span-1">
              <div className="bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-6 sticky top-24">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Informações</h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">Enviado por</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 mr-2">
                        <span className="text-xs font-semibold leading-none">
                          {ticket.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{ticket.user?.email || 'Usuário não encontrado'}</span>
=======
            <div className="lg:col-span-1 bg-gray-50 lg:bg-white px-6 py-6 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Informações</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Enviado por</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 mr-2">
                        <span className="text-xs font-medium leading-none">
                          {ticket.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-gray-900">{ticket.user?.email || 'Usuário não encontrado'}</span>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    </div>
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">Atribuído para</div>
                    <div className="flex items-center">
                      {ticket.assigned_to ? (
                        <>
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white mr-2">
                            <span className="text-xs font-semibold leading-none">
                              {ticket.assigned_staff?.email?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
=======
                    <div className="text-xs text-gray-500 mb-1">Atribuído para</div>
                    <div className="flex items-center">
                      {ticket.assigned_to ? (
                        <>
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 mr-2">
                            <span className="text-xs font-medium leading-none">
                              {ticket.assigned_staff?.email?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          </span>
                          <span className="text-sm font-medium text-gray-900">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                            {ticket.assigned_staff?.email || `Equipe (${ticket.assigned_to.substring(0,8)}...)`}
                          </span>
                        </>
                      ) : (
<<<<<<< HEAD
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400">
=======
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                          Não atribuído
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
<<<<<<< HEAD
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-medium">Criado em</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{formatDate(ticket.created_at)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-medium">Última atualização</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{formatDate(ticket.updated_at)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">Categoria</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/50">
                        <svg className="mr-1.5 h-2 w-2 text-indigo-400 dark:text-indigo-400" fill="currentColor" viewBox="0 0 8 8">
=======
                    <div className="text-xs text-gray-500 mb-1">Criado em</div>
                    <div className="text-sm text-gray-900">{formatDate(ticket.created_at)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Última atualização</div>
                    <div className="text-sm text-gray-900">{formatDate(ticket.updated_at)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Categoria</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <svg className="mr-1.5 h-2 w-2 text-indigo-400" fill="currentColor" viewBox="0 0 8 8">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {getCategoryName(ticket.category || 'outro')}
                      </span>
                    </div>
                  </div>
                </div>
<<<<<<< HEAD
                
                <div className="pt-5 mt-5 border-t border-slate-200/60 dark:border-slate-700/40">
                  <Link 
                    to={role === 'staff' ? "/tickets" : "/my-tickets"}
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {role === 'staff' ? 'Voltar para Lista de Chamados' : 'Voltar para Meus Chamados'}
                  </Link>
                </div>
=======
              </div>
              
              <div className="py-3 border-t border-gray-200">
                <Link 
                  to={role === 'staff' ? "/tickets" : "/my-tickets"}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {role === 'staff' ? 'Voltar para Lista de Chamados' : 'Voltar para Meus Chamados'}
                </Link>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default TicketDetails;
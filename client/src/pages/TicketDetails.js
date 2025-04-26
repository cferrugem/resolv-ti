import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
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

  if (isLoading) {
    return (
      <PageContainer title="Loading Ticket...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Ticket Details">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="mt-2 text-sm">
                <Link to="/my-tickets" className="text-red-700 font-medium underline">
                  Go back to tickets
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!ticket) {
    return (
      <PageContainer title="Ticket Not Found">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-5.586a1 1 0 01-.707-.293l-5.414-5.414a1 1 0 01-.293-.707V5a2 2 0 012-2H15a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Ticket not found</h2>
          <p className="mt-1 text-gray-500">The requested ticket does not exist or you don't have permission to view it.</p>
          <div className="mt-6">
            <Link to="/my-tickets" className="text-blue-600 hover:text-blue-800 font-medium">
              Go back to tickets
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Ticket: ${ticket.title}`}>
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        {/* Ticket header */}
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{ticket.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created {formatDate(ticket.created_at)}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium border ${
                ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                ticket.status === 'in progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                ticket.status === 'closed' ? 'bg-green-100 text-green-800 border-green-300' :
                'bg-gray-100 text-gray-800 border-gray-300' // Default/fallback style
              }`}>
                {/* Icons for status */}
                {ticket.status === 'open' && <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>}
                {ticket.status === 'in progress' && <svg className="w-3 h-3 mr-1.5 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.5a1.5 1.5 0 013 0V5a1 1 0 01-2 0V3.5zM10 15a1.5 1.5 0 013 0v1.5a1 1 0 11-2 0V15zm-5-1.5a1.5 1.5 0 000 3H6a1 1 0 100-2H5zm11.5 0a1.5 1.5 0 000 3H18a1 1 0 100-2h-1.5zM5 6.5a1.5 1.5 0 010-3H3.5a1 1 0 000 2H5zm11.5 0a1.5 1.5 0 010-3H15a1 1 0 100 2h1.5z" /></svg>}
                {ticket.status === 'closed' && <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                {/* Capitalize status */}
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
              <span className="mt-1 text-sm text-gray-500">
                Priority: <span className="font-medium">{ticket.priority}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ticket details */}
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-gray-900 whitespace-pre-line">{ticket.description}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Submitted by</dt>
              <dd className="mt-1 text-gray-900">{user.email}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Assigned to</dt>
              <dd className="mt-1 text-gray-900">
                {ticket.assigned_to ? (
                  // If assigned_to exists but the assigned_staff object is empty or email is missing
                  ticket.assigned_staff?.email || `Staff (${ticket.assigned_to.substring(0,8)}...)`
                ) : (
                  'Unassigned'
                )}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Last updated</dt>
              <dd className="mt-1 text-gray-900">{formatDate(ticket.updated_at)}</dd>
            </div>
          </dl>
        </div>

        {/* Comments section */}
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Comments</h3>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No comments yet.</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="space-y-4">
                {comments.map((comment, index) => (
                  <li key={comment.id} className={`${index === comments.length - 1 ? 'pb-0' : 'border-b border-gray-200 pb-4'}`}>
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          users[comment.user_id]?.role === 'staff' ? 
                          'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {users[comment.user_id]?.role === 'staff' ? 'S' : 'U'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {users[comment.user_id]?.email || 'Unknown user'}
                          <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                            users[comment.user_id]?.role === 'staff' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {users[comment.user_id]?.role === 'staff' ? 'Staff' : 'Customer'}
                          </span>
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {formatDate(comment.created_at)}
                          </span>
                        </p>
                        <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                          {comment.comment}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Add comment form */}
          <div className="mt-6" ref={commentRef}>
            <form onSubmit={handleAddComment}>
              <div className="mb-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Type your comment here..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {role === 'staff' && (
  <button
    onClick={handleDeleteTicket}
    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  >
    Delete Ticket
  </button>
)}
    </PageContainer>
  );
}

export default TicketDetails;
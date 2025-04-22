import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';

function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [totalTickets, setTotalTickets] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        // Check authentication and role
        if (!user) {
          navigate('/login');
          return;
        }

        if (role !== 'staff') {
          navigate('/my-tickets');
          return;
        }

        // Fetch dashboard data
        const { data, error, count } = await supabase
          .from('tickets')
          .select('*', { count: 'exact' });

        if (error) throw error;

        setTotalTickets(count || 0);
        const openCount = data?.filter(ticket => ticket.status === 'open').length || 0;
        setOpenTickets(openCount);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, role, navigate]);

  if (isLoading) {
    return (
      <PageContainer title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{totalTickets}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Tickets</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{openTickets}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button 
          onClick={() => navigate('/tickets')} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All Tickets
        </button>
      </div>
    </PageContainer>
  );
}

export default Dashboard;
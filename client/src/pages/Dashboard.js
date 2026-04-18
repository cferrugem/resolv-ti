import { supabase } from '../supabase';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PageContainer from '../components/PageContainer';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes do ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [totalTickets, setTotalTickets] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [inProgressTickets, setInProgressTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);
  const [recentTickets, setRecentTickets] = useState([]);
  const [urgentTickets, setUrgentTickets] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [ticketTrend, setTicketTrend] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('week');
  const [categoryData, setCategoryData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState({ labels: [], datasets: [] });
  const [categories, setCategories] = useState([]);
  const [userTicketsData, setUserTicketsData] = useState({ labels: [], datasets: [] });
  const [techTicketsData, setTechTicketsData] = useState({ labels: [], datasets: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        if (!user) {
          navigate('/login');
          return;
        }

        if (role !== 'staff') {
          navigate('/my-tickets');
          return;
        }

        // Obter data atual e calcular intervalo com base no período selecionado
        const now = new Date();
        let startDate;
        
        switch(timeFrame) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          default:
            startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        const startDateString = startDate.toISOString();

        // Buscar as definições de categorias para exibir nomes amigáveis
        const categoriesResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tickets/categories`);
        if (!categoriesResponse.ok) throw new Error('Falha ao buscar categorias');
        const categoriesData = await categoriesResponse.json();
        if (isMounted) setCategories(categoriesData);
        
        // Buscar todos os dados de tickets
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            user:user_id (
              id,
              email
            ),
            assigned_staff:assigned_to (
              id,
              email
            ),
            ticket_comments (
              id,
              created_at
            )
          `)
          .gte('created_at', startDateString)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calcular estatísticas
        setTotalTickets(data.length);
        setOpenTickets(data.filter(ticket => ticket.status === 'open').length);
        setInProgressTickets(data.filter(ticket => ticket.status === 'in progress').length);
        setClosedTickets(data.filter(ticket => ticket.status === 'closed').length);
        
        // Calcular tickets urgentes
        setUrgentTickets(data.filter(ticket => ticket.priority === 'high').length);
        
        // Obter tickets recentes
        setRecentTickets(data.slice(0, 5));

        // Calcular tempo médio de resposta (tempo até o primeiro comentário)
        const ticketsWithComments = data.filter(ticket => ticket.ticket_comments && ticket.ticket_comments.length > 0);
        let totalResponseTime = 0;
        
        ticketsWithComments.forEach(ticket => {
          const createdAt = new Date(ticket.created_at);
          const firstComment = new Date(ticket.ticket_comments[0].created_at);
          const diffTime = Math.abs(firstComment - createdAt);
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          totalResponseTime += diffHours;
        });
        
        const avgResponseTime = ticketsWithComments.length > 0 ? 
          (totalResponseTime / ticketsWithComments.length).toFixed(1) : 0;
        setResponseTime(avgResponseTime);

        // Gerar dados de tendência de tickets (últimos 7 dias)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();
        
        const trendsData = last7Days.map(date => {
          return {
            date,
            count: data.filter(ticket => ticket.created_at.startsWith(date)).length
          };
        });
        
        setTicketTrend(trendsData);

        // Calcular os principais usuários que criam tickets
        const userCounts = {};
        data.forEach(ticket => {
          const email = ticket.user?.email || 'Desconhecido';
          userCounts[email] = (userCounts[email] || 0) + 1;
        });
        
        setTopUsers(Object.entries(userCounts)
          .map(([email, count]) => ({ email, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5));

        // Calcular desempenho da equipe
        const staffData = {};
        data.filter(ticket => ticket.assigned_to).forEach(ticket => {
          const email = ticket.assigned_staff?.email || 'Desconhecido';
          if (!staffData[email]) {
            staffData[email] = { assigned: 0, closed: 0 };
          }
          staffData[email].assigned += 1;
          if (ticket.status === 'closed') {
            staffData[email].closed += 1;
          }
        });
        
        setStaffPerformance(Object.entries(staffData)
          .map(([email, stats]) => ({ 
            email, 
            assigned: stats.assigned, 
            closed: stats.closed,
            efficiency: stats.assigned > 0 ? Math.round((stats.closed / stats.assigned) * 100) : 0
          }))
          .sort((a, b) => b.efficiency - a.efficiency));

        // Calcular métricas por categoria
        const categoryCount = {};
        
        // Inicializar contadores para cada categoria
        categoriesData.forEach(cat => {
          categoryCount[cat.id] = 0;
        });
        
        // Contar tickets por categoria
        data.forEach(ticket => {
          const ticketCategory = ticket.category || 'outro';
          categoryCount[ticketCategory] = (categoryCount[ticketCategory] || 0) + 1;
        });
        
        // Preparar dados para o gráfico
        const categoryStats = Object.entries(categoryCount)
          .map(([catId, count]) => {
            const category = categoriesData.find(c => c.id === catId) || { name: catId, id: catId };
            return {
              id: catId,
              name: category.name,
              count
            };
          })
          .sort((a, b) => b.count - a.count);

        if (isMounted) setCategoryData(categoryStats);

        // Criar dados para o gráfico de categorias
        const categoryChart = {
          labels: categoryStats.map(cat => cat.name),
          datasets: [
            {
              label: 'Chamados por Categoria',
              data: categoryStats.map(cat => cat.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(199, 199, 199, 0.7)',
                'rgba(83, 102, 255, 0.7)',
                'rgba(255, 99, 255, 0.7)',
                'rgba(255, 159, 144, 0.7)'
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 206, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
                'rgb(255, 159, 64)',
                'rgb(199, 199, 199)',
                'rgb(83, 102, 255)',
                'rgb(255, 99, 255)',
                'rgb(255, 159, 144)'
              ],
              borderWidth: 1
            }
          ]
        };
        
        if (isMounted) setCategoryChartData(categoryChart);

        // Process user tickets data
        const userStats = Object.entries(userCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Get top 10 users

        setUserTicketsData({
          labels: userStats.map(([email]) => email.split('@')[0]),
          datasets: [{
            label: 'Chamados Abertos',
            data: userStats.map(([_, count]) => count),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        });

        // Process technician tickets data
        const techStats = Object.entries(staffData)
          .sort((a, b) => b[1].assigned - a[1].assigned)
          .slice(0, 10); // Get top 10 techs

        setTechTicketsData({
          labels: techStats.map(([email]) => email.split('@')[0]),
          datasets: [{
            label: 'Chamados Atribuídos',
            data: techStats.map(([_, stats]) => stats.assigned),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }, {
            label: 'Chamados Fechados',
            data: techStats.map(([_, stats]) => stats.closed),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }]
        });

      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, [user, role, navigate, timeFrame, refreshKey]);

  // Auto-refresh logic
  useEffect(() => {
    if (!user || role !== 'staff') return;
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [user, role]);

  // Dados para gráfico de status
  const statusChartData = {
    labels: ['Aberto', 'Em Andamento', 'Fechado'],
    datasets: [
      {
        label: 'Tickets por Status',
        data: [openTickets, inProgressTickets, closedTickets],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de tendências
  const trendChartData = {
    labels: ticketTrend.map(item => item.date.substring(5)),
    datasets: [
      {
        label: 'Novos Tickets',
        data: ticketTrend.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgb(66, 133, 244)',
        tension: 0.4
      }
    ]
  };

  // Dados para gráfico de desempenho da equipe
  const staffChartData = {
    labels: staffPerformance.map(item => item.email.split('@')[0]),
    datasets: [
      {
        label: 'Atribuídos',
        data: staffPerformance.map(item => item.assigned),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: 'Fechados',
        data: staffPerformance.map(item => item.closed),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

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
    <PageContainer title="Painel de Suporte">
      {/* Seletor de período */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" role="group">
          <button
            type="button"
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              timeFrame === 'week' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 text-sm font-semibold border-x border-slate-200 dark:border-slate-700 transition-colors ${
              timeFrame === 'month' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => setTimeFrame('quarter')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              timeFrame === 'quarter' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Trimestre
          </button>
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="glass-card overflow-hidden border-l-4 border-blue-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Total de Tickets</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-yellow-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Abertos</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{openTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-blue-600 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-600 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Em Andamento</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{inProgressTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-green-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Fechados</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{closedTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-red-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Urgentes</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{urgentTickets}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card overflow-hidden border-l-4 border-purple-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Tempo Médio Resp.</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">{responseTime}h</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Nova Card - Categoria mais frequente */}
        <div className="glass-card overflow-hidden border-l-4 border-indigo-500 transition-transform hover:scale-105">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Categoria Principal</dt>
                <dd className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {categoryData.length > 0 ? categoryData[0].name : "N/A"}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Principal dos Gráficos */}
      <div className="space-y-6 mb-8">
        
        {/* Linha 1: Tendências (2/3) e Status (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Tendências de Chamados</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Histórico de novas aberturas</p>
              </div>
              <span className="inline-flex text-xs font-semibold text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/40 px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-700/50 self-start sm:self-auto">
                Últimos {ticketTrend.length} dias
              </span>
            </div>
            <div className="h-72 w-full flex-1 relative">
              <Line data={trendChartData} options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#0f172a',
                    bodyColor: '#334155',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 10,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                    ticks: { precision: 0, color: '#64748b' }
                  },
                  x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#64748b' }
                  }
                }
              }} />
            </div>
          </div>

          <div className="lg:col-span-1 glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Status Atual</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Distribuição de andamento</p>
            </div>
            <div className="h-64 flex-1 flex items-center justify-center relative">
              <div className="w-full max-w-[260px] mx-auto">
                <Doughnut data={statusChartData} options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { padding: 20, usePointStyle: true, color: '#475569', font: { weight: '500' } }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#0f172a',
                      bodyColor: '#334155',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                    }
                  },
                  cutout: '75%',
                  elements: {
                    arc: { borderWidth: 0 }
                  }
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Linha 2: Categorias e Desempenho (1/2 cada) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Distribuição por Categorias</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Volume de chamados por especialidade</p>
            </div>
            <div className="h-72 w-full flex-1 relative">
              <Bar data={categoryChartData} options={{ 
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#0f172a',
                    bodyColor: '#334155',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                    ticks: { precision: 0, color: '#64748b' }
                  },
                  x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { maxRotation: 45, minRotation: 45, color: '#64748b' }
                  }
                },
                borderRadius: 4
              }} />
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Desempenho da Equipe</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tickets atribuídos vs fechados</p>
              </div>
            </div>
            <div className="h-72 w-full flex-1 relative">
              <Bar 
                data={techTicketsData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { 
                      position: 'top',
                      align: 'end',
                      labels: { usePointStyle: true, boxWidth: 6, color: '#475569' }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#0f172a',
                      bodyColor: '#334155',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                      ticks: { precision: 0, color: '#64748b' }
                    },
                    x: {
                      grid: { display: false, drawBorder: false },
                      ticks: { maxRotation: 45, minRotation: 45, color: '#64748b' }
                    }
                  },
                  borderRadius: 4
                }}
              />
            </div>
          </div>
        </div>

        {/* Linha 3: Tabela Detalhamento (2/3) e Top Usuários (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Detalhamento por Categorias</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Análise aprofundada para alocação de recursos</p>
              </div>
            </div>
            <div className="overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 flex-1">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Chamados</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Porcentagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categoryData.length > 0 ? categoryData.map((category) => {
                    const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);
                    const percentage = total > 0 ? Math.round((category.count / total) * 100) : 0;
                    return (
                      <tr key={category.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{category.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-full flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-9">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">
                        Nenhum dado disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 glass-card p-6 md:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Top 10 Usuários</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Maiores solicitantes</p>
            </div>
            <div className="h-80 w-full flex-1 relative">
              <Bar 
                data={userTicketsData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#0f172a',
                      bodyColor: '#334155',
                      borderColor: '#e2e8f0',
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
                      ticks: { precision: 0, color: '#64748b' }
                    },
                    y: {
                      grid: { display: false, drawBorder: false },
                      ticks: { color: '#64748b', font: { weight: '500' } }
                    }
                  },
                  borderRadius: 4
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo existente... */}
    </PageContainer>
  );
}

export default Dashboard;
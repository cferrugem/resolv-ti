import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';  // Corrigido o caminho de importação
import { supabase } from '../supabase';

export default function CreateTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('hardware');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscar categorias disponíveis
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/tickets/categories');
        if (!response.ok) throw new Error('Falha ao carregar categorias');
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) setCategory(data[0].id);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        setError('Não foi possível carregar as categorias.');
      }
    }
    
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logado para criar um chamado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão de autenticação não encontrada');
      }

      // Create ticket
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          category, // Incluir categoria no payload
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('O servidor retornou uma resposta não-JSON');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar chamado');
      }

      alert('Chamado criado com sucesso!');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('hardware');
      navigate('/my-tickets');
    } catch (err) {
      console.error('Erro ao criar chamado:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card p-6 md:p-10 z-10">
        <div className="border-b border-slate-200/60 dark:border-slate-700/40 pb-5 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">Criar Novo Chamado</h2>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">Preencha os detalhes do seu problema para que possamos ajudá-lo.</p>
        </div>
        
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/30 p-6 rounded-2xl">
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Título <span className="text-primary-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="appearance-none block w-full px-4 py-3 form-input-dark sm:text-sm"
                placeholder="Resumo do problema em poucas palavras"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Um título claro ajuda nossa equipe a entender seu problema rapidamente.</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Descrição <span className="text-primary-500">*</span>
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="appearance-none block w-full px-4 py-3 form-input-dark sm:text-sm"
                placeholder="Descreva seu problema em detalhes. Inclua passos para reproduzir o problema, mensagens de erro, e qualquer informação relevante."
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Forneça o máximo de detalhes possível para agilizar a solução.</p>
            </div>

            {/* Campo de Categoria */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoria <span className="text-primary-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-3 py-2.5 form-select-dark sm:text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} - {cat.description}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">Selecione a categoria que melhor descreve seu problema.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/30 p-6 rounded-2xl">
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Prioridade <span className="text-primary-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="priority-low"
                    name="priority"
                    type="radio"
                    value="low"
                    checked={priority === "low"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-4 w-4 border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
                  />
                  <label htmlFor="priority-low" className="ml-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2"></span>
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Baixa</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">- Problema menor, sem impacto crítico</span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="priority-medium"
                    name="priority"
                    type="radio"
                    value="medium"
                    checked={priority === "medium"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-4 w-4 border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 dark:bg-slate-800"
                  />
                  <label htmlFor="priority-medium" className="ml-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-2"></span>
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Média</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">- Problema que afeta o trabalho, mas existe alternativa</span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="priority-high"
                    name="priority"
                    type="radio"
                    value="high"
                    checked={priority === "high"}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-4 w-4 border-slate-300 dark:border-slate-600 text-red-600 focus:ring-red-500 dark:bg-slate-800"
                  />
                  <label htmlFor="priority-high" className="ml-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Alta</span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">- Problema crítico, impede o trabalho</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200/60 dark:border-slate-700/40">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary shadow-primary-500/30"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando...
                  </>
                ) : (
                  "Criar Chamado"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
=======
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Criar Novo Chamado</h2>
        <p className="mt-1 text-sm text-gray-500">Preencha os detalhes do seu problema para que possamos ajudá-lo.</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Resumo do problema em poucas palavras"
            />
            <p className="mt-1 text-xs text-gray-500">Um título claro ajuda nossa equipe a entender seu problema rapidamente.</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Descreva seu problema em detalhes. Inclua passos para reproduzir o problema, mensagens de erro, e qualquer informação relevante."
            />
            <p className="mt-1 text-xs text-gray-500">Forneça o máximo de detalhes possível para agilizar a solução.</p>
          </div>

          {/* Campo de Categoria */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Selecione a categoria que melhor descreve seu problema.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="priority-low"
                  name="priority"
                  type="radio"
                  value="low"
                  checked={priority === "low"}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="priority-low" className="ml-3 flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                  <span className="block text-sm font-medium text-gray-700">Baixa</span>
                  <span className="ml-2 text-xs text-gray-500">- Problema menor, sem impacto crítico</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="priority-medium"
                  name="priority"
                  type="radio"
                  value="medium"
                  checked={priority === "medium"}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="priority-medium" className="ml-3 flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></span>
                  <span className="block text-sm font-medium text-gray-700">Média</span>
                  <span className="ml-2 text-xs text-gray-500">- Problema que afeta o trabalho, mas existe alternativa</span>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="priority-high"
                  name="priority"
                  type="radio"
                  value="high"
                  checked={priority === "high"}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="priority-high" className="ml-3 flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                  <span className="block text-sm font-medium text-gray-700">Alta</span>
                  <span className="ml-2 text-xs text-gray-500">- Problema crítico, impede o trabalho</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </>
              ) : (
                "Criar Chamado"
              )}
            </button>
          </div>
        </div>
      </form>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
    </div>
  );
}
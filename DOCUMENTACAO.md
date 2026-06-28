# 📘 ResolvTI — Documentação Técnica Completa

> **Versão:** 1.0.0  
> **Autores:** Cleiton Ferrugem, Lucas Gades  
> **Stack:** React + Node.js/Express + Supabase (PostgreSQL)  
> **Última atualização:** Março de 2026

---

## 📑 Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Configuração e Instalação](#4-configuração-e-instalação)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Backend — Servidor Node.js](#6-backend--servidor-nodejs)
7. [Frontend — Cliente React](#7-frontend--cliente-react)
8. [Banco de Dados — Supabase](#8-banco-de-dados--supabase)
9. [Autenticação e Autorização](#9-autenticação-e-autorização)
10. [Funcionalidades por Papel (Role)](#10-funcionalidades-por-papel-role)
11. [API REST — Endpoints](#11-api-rest--endpoints)
12. [Componentes do Frontend](#12-componentes-do-frontend)
13. [Páginas do Frontend](#13-páginas-do-frontend)
14. [Deploy com Render](#14-deploy-com-render)
15. [Problemas Conhecidos e Melhorias Futuras](#15-problemas-conhecidos-e-melhorias-futuras)

---

## 1. Visão Geral do Projeto

O **ResolvTI** é uma plataforma web de gestão de chamados de suporte técnico. O projeto nasceu da necessidade real de digitalizar e organizar o atendimento de TI da Procuradoria-Geral da Fazenda Nacional (4ª Região), onde o suporte era realizado inteiramente por telefone — sem registro, rastreabilidade ou análise.

### Problemas que o ResolvTI resolve

| Problema (Cenário Anterior) | Solução ResolvTI |
|---|---|
| Chamados por telefone, sem registro | Abertura de chamados via formulário web |
| Sem acompanhamento de status | Painel em tempo real com status de cada chamado |
| Sem categoria ou prioridade | Classificação por categoria (10 tipos) e prioridade |
| Sem métricas de desempenho | Dashboard com gráficos e KPIs da equipe |
| Dificuldade de atribuir responsável | Atribuição de chamados a técnicos específicos |
| Sem histórico de comunicação | Sistema de comentários por chamado |

---

## 2. Arquitetura do Sistema

```
┌──────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                │
│            React 19 + TailwindCSS + Chart.js         │
│      Roteamento: React Router DOM v7                 │
│      Auth Client: Supabase JS SDK                    │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP (REST) — port 5000
                      │ (criação de tickets e comentários)
┌─────────────────────▼────────────────────────────────┐
│                   BACKEND (Server)                   │
│         Node.js + Express 5 (ES Modules)             │
│         Porta padrão: 5000                           │
│         Rotas:                                       │
│          - /api/tickets  (GET categories, POST, PUT)│
│          - /api/comments (POST)                      │
└──────────────────────┬───────────────────────────────┘
                       │ @supabase/supabase-js
┌──────────────────────▼───────────────────────────────┐
│               SUPABASE (BaaS)                        │
│  PostgreSQL: tabelas tickets, users, ticket_comments │
│  Auth: Supabase Auth (JWT)                           │
│  RLS (Row Level Security): ativo por usuário         │
│  RPC Function: create_ticket_comment                 │
└──────────────────────────────────────────────────────┘
```

> **Nota sobre conexão direta:** Além das chamadas via backend, o frontend também acessa o Supabase **diretamente** para leitura de tickets, listagem de chamados, Dashboard e comentários (usando o SDK do Supabase no browser com RLS). O backend é usado principalmente para **escrita autenticada** de tickets e comentários.

---

## 3. Estrutura de Pastas

```
resolv-ti-master/
├── client/                        # Frontend React
│   ├── public/
│   │   └── logo.png               # Logotipo da aplicação
│   ├── src/
│   │   ├── components/            # Componentes reutilizáveis
│   │   │   ├── Card.js            # Card genérico
│   │   │   ├── CreateTicket.js    # Formulário de criação de chamado
│   │   │   ├── LoadingSpinner.js  # Spinner de carregamento
│   │   │   ├── Login.js           # Formulário de login
│   │   │   ├── NavBar.js          # Barra de navegação
│   │   │   ├── PageContainer.js   # Wrapper de layout de página
│   │   │   ├── PageHeader.js      # Cabeçalho de seção
│   │   │   ├── Register.js        # Formulário de cadastro
│   │   │   ├── RequireAuth.js     # Guard de rota autenticada
│   │   │   ├── StatusBadge.js     # Badge de status colorido
│   │   │   └── TicketItem.js      # Item de chamado na lista
│   │   ├── pages/                 # Páginas principais
│   │   │   ├── Dashboard.js       # Painel de KPIs (apenas staff)
│   │   │   ├── MyTickets.js       # Meus chamados (apenas cliente)
│   │   │   ├── TicketDetails.js   # Detalhes de um chamado
│   │   │   └── TicketList.js      # Lista de todos os chamados (staff)
│   │   ├── App.js                 # Configuração de rotas
│   │   ├── AuthContext.js         # Contexto global de autenticação
│   │   ├── index.js               # Entry point React
│   │   ├── index.css              # Estilos globais (input TailwindCSS)
│   │   ├── output.css             # CSS compilado (TailwindCSS output)
│   │   └── supabase.js            # Inicialização do cliente Supabase
│   ├── .env.local                 # Variáveis de ambiente do cliente (não commitado)
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                        # Backend Express
│   ├── routes/
│   │   ├── tickets.js             # Rotas de chamados
│   │   └── comments.js            # Rotas de comentários
│   ├── app.js                     # Entry point do servidor
│   ├── .env                       # Variáveis de ambiente do servidor (não commitado)
│   └── package.json
│
├── render.yaml                    # Configuração de deploy (Render.com)
├── README.md                      # Resumo executivo do projeto
├── DOCUMENTACAO.md                # ← Este arquivo
└── .gitignore
```

---

## 4. Configuração e Instalação

### Pré-requisitos

- Node.js **18+** (recomendado) ou 14+
- npm 8+
- Conta no [Supabase](https://supabase.com) com projeto criado
- Git

### Passo a passo (desenvolvimento local)

#### 1. Clone o repositório

```bash
git clone https://github.com/cferrugem/resolv-.git
cd resolv-ti-master
```

#### 2. Configure o servidor (backend)

```bash
cd server
npm install
```

Crie o arquivo `.env` na pasta `server/` (veja a seção [Variáveis de Ambiente](#5-variáveis-de-ambiente)):

```bash
# server/.env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
PORT=5000
```

```bash
# Iniciar servidor em modo de desenvolvimento (com hot-reload)
npm run dev

# Ou em produção
npm start
```

O servidor estará disponível em `http://localhost:5000`.

#### 3. Configure o cliente (frontend)

```bash
cd ../client
npm install
```

Crie o arquivo `.env.local` na pasta `client/`:

```bash
# client/.env.local
REACT_APP_SUPABASE_URL=https://SEU_PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_aqui
REACT_APP_API_URL=http://localhost:5000
```

```bash
# Iniciar cliente React + compilação do CSS em paralelo
npm run dev

# Ou apenas o React sem watch do CSS
npm start
```

O frontend estará em `http://localhost:3000`.

---

## 5. Variáveis de Ambiente

### Servidor (`server/.env`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `SUPABASE_ANON_KEY` | Chave anon pública do Supabase | ✅ Sim |
| `PORT` | Porta do servidor Express | Não (padrão: 5000) |

### Cliente (`client/.env.local`)

| Variável | Descrição | Obrigatório |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | URL do projeto Supabase | ✅ Sim |
| `REACT_APP_SUPABASE_ANON_KEY` | Chave anon pública do Supabase | ✅ Sim |
| `REACT_APP_API_URL` | URL base do backend (ex: `http://localhost:5000`) | Não (hardcoded atualmente) |

> ⚠️ **Atenção:** Os arquivos `.env` e `.env.local` estão no `.gitignore` e **nunca devem ser commitados**. Nunca use a `service_role` key no frontend.

---

## 6. Backend — Servidor Node.js

### Configuração (`server/app.js`)

O servidor usa **Express 5** com módulos ES (`"type": "module"`). As configurações principais são:

- **CORS** habilitado para todas as origens (em produção, isto deve ser restringido)
- **JSON body parsing** via `express.json()`
- **Middleware global de erros** que captura exceções não tratadas e retorna HTTP 500
- Porta configurável via `PORT` env (padrão: 5000)

### Rotas disponíveis

| Método | Rota | Arquivo | Autenticação |
|---|---|---|---|
| GET | `/api/tickets/categories` | `routes/tickets.js` | Não |
| POST | `/api/tickets` | `routes/tickets.js` | JWT Bearer |
| PUT | `/api/tickets/:id` | `routes/tickets.js` | JWT Bearer (staff only) |
| POST | `/api/comments` | `routes/comments.js` | JWT Bearer |

### Padrão de autenticação no backend

Todas as rotas protegidas extraem o token JWT do header `Authorization: Bearer <token>`. O token é obtido via `supabase.auth.getSession()` no cliente e enviado no header.

O backend valida o token criando um **novo cliente Supabase** com o token do usuário, garantindo que os dados do banco sejam filtrados pelo RLS:

```js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
const { data: { user } } = await supabase.auth.getUser();
```

---

## 7. Frontend — Cliente React

### Configuração de Roteamento (`src/App.js`)

O roteamento usa **React Router DOM v7** com proteção por papel:

| Rota | Componente | Acesso |
|---|---|---|
| `/login` | `Login` | Público |
| `/register` | `Register` | Público |
| `/dashboard` | `Dashboard` | `staff` |
| `/tickets` | `TicketList` | `staff` |
| `/my-tickets` | `MyTickets` | `customer` |
| `/create-ticket` | `CreateTicket` | `customer` |
| `/ticket/:id` | `TicketDetails` | Autenticado |
| `/unauthorized` | `Unauthorized` | Todos |
| `*` | Redirect para `/` | — |

#### Componente `RequireAuth`

Protege rotas com base no estado de autenticação e papel do usuário. Redireciona para `/login` se não autenticado, ou para `/unauthorized` se o papel não corresponder.

#### Componente `PublicRoute`

Redireciona usuários já autenticados para sua página inicial correta (`/dashboard` para staff, `/my-tickets` para clientes), impedindo que acessem login/registro novamente.

### Bibliotecas principais utilizadas

| Biblioteca | Versão | Finalidade |
|---|---|---|
| `react` | 19.x | UI Framework |
| `react-router-dom` | 7.x | Roteamento SPA |
| `@supabase/supabase-js` | 2.49.x | Comunicação com Supabase |
| `chart.js` + `react-chartjs-2` | 4.x / 5.x | Gráficos no Dashboard |
| `framer-motion` | 12.x | Animações |
| `react-icons` | 5.x | Ícones |
| `date-fns` | 4.x | Formatação de datas |
| `tailwindcss` | 3.x | Estilização CSS utility-first |
| `@tailwindcss/forms` | 0.5.x | Estilo de formulários |

---

## 8. Banco de Dados — Supabase

### Tabelas

#### `users`
Tabela de perfis dos usuários (complementa o `auth.users` do Supabase Auth).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK, FK → auth.users) | ID do usuário |
| `email` | `text` | E-mail do usuário |
| `role` | `text` | Papel: `'customer'` ou `'staff'` |

#### `tickets`
Tabela principal de chamados de suporte.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | ID do chamado |
| `title` | `text` | Título do chamado |
| `description` | `text` | Descrição detalhada |
| `status` | `text` | `'open'`, `'in progress'`, `'closed'` |
| `priority` | `text` | `'low'`, `'medium'`, `'high'` |
| `category` | `text` | Categoria do problema (ver abaixo) |
| `user_id` | `uuid` (FK → users) | Usuário que abriu |
| `assigned_to` | `uuid` (FK → users, nullable) | Técnico responsável |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização |

#### `ticket_comments`
Comentários em chamados.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` (PK) | ID do comentário |
| `ticket_id` | `uuid` (FK → tickets) | Chamado relacionado |
| `user_id` | `uuid` (FK → users) | Autor do comentário |
| `comment` | `text` | Texto do comentário |
| `created_at` | `timestamptz` | Data de criação |

### Categorias de chamados

As categorias são **predefinidas no servidor** (rota `GET /api/tickets/categories`) e não estão em uma tabela separada no banco:

| ID | Nome | Descrição |
|---|---|---|
| `hardware` | Hardware | Problemas com equipamentos físicos |
| `software` | Software | Problemas com programas e SOs |
| `rede` | Rede/Internet | Problemas de conexão e rede |
| `email` | Email/Comunicação | Problemas com e-mail e comunicação |
| `impressora` | Impressoras | Problemas com impressoras |
| `seguranca` | Segurança | Questões de segurança digital |
| `acesso` | Acesso/Contas | Problemas com senhas e permissões |
| `sistemas` | Sistemas Internos | Sistemas da empresa |
| `aplicacao` | Erro de Aplicação | Erros em aplicativos específicos |
| `outro` | Outros | Outros problemas não listados |

### Row Level Security (RLS)

O RLS do Supabase garante que:
- **Clientes** vejam apenas seus próprios chamados
- **Staff** tenha acesso a todos os chamados
- Comentários só possam ser criados por usuários autenticados

### Funções RPC

#### `create_ticket_comment(p_ticket_id uuid, p_comment_text text)`

Função armazenada no Supabase para criação de comentários com autenticação garantida pelo contexto da sessão. O frontend tenta usar esta função primeiro; se falhar, faz um `insert` direto como fallback.

---

## 9. Autenticação e Autorização

### Fluxo de autenticação

```
1. Usuário faz login → Supabase Auth → retorna session (JWT)
2. AuthContext.js lê a session → busca role em `users` table
3. Papel (role) é armazenado no Context global
4. RequireAuth usa o role para controlar acesso às rotas
5. Operações no backend enviam o JWT no header Authorization
```

### `AuthContext.js`

Provider global que expõe:

| Valor | Tipo | Descrição |
|---|---|---|
| `user` | `object \| null` | Objeto do usuário Supabase Auth |
| `role` | `'staff' \| 'customer' \| null` | Papel do usuário |
| `isLoading` | `boolean` | Se a verificação de auth ainda está em curso |

**Ciclo de vida:**
- Na montagem: verifica sessão existente via `supabase.auth.getSession()`
- Registra listener `onAuthStateChange` para reagir a login/logout em tempo real
- No logout: define `user` e `role` como `null`

---

## 10. Funcionalidades por Papel (Role)

### 👤 Cliente (`customer`)

| Funcionalidade | Descrição |
|---|---|
| **Registrar-se** | Cria conta com email/senha |
| **Login** | Autenticação via Supabase Auth |
| **Abrir chamado** | Formulário com título, descrição, prioridade e categoria |
| **Ver meus chamados** | Lista filtrada apenas por seus chamados |
| **Filtrar chamados** | Por status, com busca por texto, ordenação |
| **Ver detalhes** | Visualizar todas informações de um chamado seu |
| **Comentar** | Adicionar comentários em seu chamado |

### 🔧 Suporte/Staff (`staff`)

Todas as funcionalidades do cliente, mais:

| Funcionalidade | Descrição |
|---|---|
| **Dashboard** | Painel com KPIs, gráficos e métricas de desempenho |
| **Ver todos os chamados** | Lista completa de todos os chamados do sistema |
| **Filtros avançados** | Status, prioridade, atribuição, categoria, busca, ordenação |
| **Atribuir chamados** | Definir técnico responsável por um chamado |
| **Atualizar status** | Mover chamado entre open → in progress → closed |
| **Excluir chamados** | Remover chamado e seus comentários permanentemente |
| **Ver métricas** | Tendências, top usuários, desempenho por técnico |

---

## 11. API REST — Endpoints

### `GET /api/tickets/categories`

Retorna a lista de categorias disponíveis para classificação de chamados.

**Autenticação:** Não requerida

**Resposta (200):**
```json
[
  { "id": "hardware", "name": "Hardware", "description": "Problemas com equipamentos físicos" },
  { "id": "software", "name": "Software", "description": "Problemas com programas e sistemas operacionais" },
  ...
]
```

---

### `POST /api/tickets`

Cria um novo chamado de suporte.

**Autenticação:** JWT Bearer obrigatório

**Body:**
```json
{
  "title": "Computador não liga",
  "description": "Ao pressionar o botão liga/desliga, nada acontece.",
  "priority": "high",
  "category": "hardware"
}
```

**Validações:**
- `title` e `description` são obrigatórios
- `priority` deve ser `"low"`, `"medium"` ou `"high"` (padrão: `"medium"`)
- `category` padrão: `"outro"`

**Resposta (201):** Objeto do ticket criado

**Erros:**
- `401` — Token ausente ou inválido
- `400` — Campos obrigatórios ausentes ou prioridade inválida
- `500` — Erro interno

---

### `PUT /api/tickets/:id`

Atualiza o status e/ou responsável de um chamado. **Exclusivo para staff.**

**Autenticação:** JWT Bearer obrigatório + papel `staff`

**Parâmetros:** `:id` — UUID do chamado

**Body (campos opcionais):**
```json
{
  "status": "in progress",
  "assigned_to": "uuid-do-tecnico"
}
```

**Resposta (200):** Objeto do ticket atualizado

**Erros:**
- `401` — Token ausente ou inválido
- `403` — Usuário não é staff
- `400` — ID do ticket ausente
- `404` — Ticket não encontrado

---

### `POST /api/comments`

Adiciona um comentário a um chamado.

**Autenticação:** JWT Bearer obrigatório

**Body:**
```json
{
  "ticket_id": "uuid-do-chamado",
  "comment": "Verificamos e o problema é na fonte de alimentação."
}
```

**Validações:**
- `ticket_id` obrigatório e deve ser UUID válido
- `comment` obrigatório e não pode ser vazio

**Resposta (201):** Objeto do comentário criado

---

## 12. Componentes do Frontend

### `NavBar.js`
Barra de navegação responsiva com links contextuais por papel:
- **Staff:** links para Painel e Todos os Chamados
- **Cliente:** links para Meus Chamados e Criar Chamado
- Mostra email do usuário e botão de logout

### `RequireAuth.js`
Guard de rota. Aceita prop `role` opcional para restrição por papel. Enquanto o auth está carregando, exibe spinner. Redireciona para `/login` ou `/unauthorized` conforme o caso.

### `CreateTicket.js`
Formulário completo de abertura de chamado com:
- Seleção de categoria (busca via `/api/tickets/categories`)
- Seleção de prioridade
- Validação de campos no cliente
- Envio via `POST /api/tickets` com token JWT

### `TicketItem.js`
Componente de item de lista de chamado com:
- Badge de status colorido
- Badge de prioridade
- Para staff: lista de técnicos disponíveis para atribuição
- Para staff: dropdown de mudança de status
- Link para detalhes do chamado

### `StatusBadge.js`
Badge de exibição de status com cores semânticas:
- 🟡 Aberto (`open`)
- 🔵 Em Andamento (`in progress`)
- 🟢 Fechado (`closed`)

### `PageContainer.js`
Wrapper de layout que centraliza o conteúdo com `max-w-7xl` e aplica padding padrão.

### `LoadingSpinner.js`
Spinner animado reutilizável para estados de carregamento.

---

## 13. Páginas do Frontend

### `Dashboard.js` (Staff)

Painel de controle com:

**KPIs (cards de estatísticas):**
- Total de tickets, Abertos, Em Andamento, Fechados
- Urgentes (prioridade alta)
- Tempo Médio de Resposta (horas até o 1º comentário)
- Categoria Mais Frequente

**Gráficos (`chart.js`):**
- 📈 **Tendências** (Line Chart): Novos tickets nos últimos 7 dias
- 🍩 **Distribuição por Status** (Doughnut Chart)
- 📊 **Distribuição por Categorias** (Bar Chart)
- 📊 **Top 10 Usuários** (Bar Chart): quem mais abre chamados
- 📊 **Desempenho da Equipe** (Bar Chart): atribuídos vs. fechados por técnico

**Controles:**
- Seletor de período: Semana / Mês / Trimestre

**Tabela de categorias:** ranking detalhado com porcentagem e barra de progresso.

### `TicketList.js` (Staff)

Lista completa de todos os chamados com:
- Cards de estatísticas rápidas (Total, Abertos, Em Andamento, Fechados, Urgentes, Não Atribuídos)
- Filtros combinados: Status, Prioridade, Atribuição, Categoria
- Busca por texto (título, descrição, email)
- Ordenação por: Mais Recentes, Mais Antigos, Prioridade, Status
- Botão "Limpar Filtros"

### `MyTickets.js` (Cliente)

Lista de chamados do próprio usuário com:
- Filtro por status
- Ordenação por data e prioridade
- Busca por texto
- Link para criar novo chamado quando vazia

### `TicketDetails.js` (Todos)

Tela de detalhes de um chamado com:
- Título, status, prioridade com badges coloridos
- ID abreviado do chamado
- Informações laterais: enviado por, atribuído a, datas, categoria
- Seção de descrição
- Histórico de comentários com avatar e badge de papel (Suporte/Cliente)
- Formulário de novo comentário
- Para staff: botão de exclusão do chamado

---

## 14. Deploy com Render

O arquivo `render.yaml` configura dois serviços no [Render.com](https://render.com):

### Backend API (`resolv-ti-api`)
- **Tipo:** Web Service (Node.js)
- **Pasta raiz:** `server/`
- **Build:** `npm install`
- **Start:** `npm start`
- **Variáveis de ambiente a configurar no Render:**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Frontend (`resolv-ti-client`)
- **Tipo:** Static Site
- **Pasta raiz:** `client/`
- **Build:** `npm install && npm run build`
- **Pasta publicada:** `build/`
- **Rewrite:** todas as rotas apontam para `/index.html` (SPA)
- **Variáveis de ambiente a configurar no Render:**
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
  - `REACT_APP_API_URL` (URL do serviço backend deployado)

### Passos para deploy

1. Faça push do código para o GitHub
2. Crie uma conta no [Render.com](https://render.com)
3. No Dashboard do Render, clique em **"New → Blueprint"** e selecione o repositório — o `render.yaml` será detectado automaticamente
4. Configure as variáveis de ambiente marcadas como `sync: false` no painel do Render
5. Após o deploy, atualize `REACT_APP_API_URL` com a URL do backend deployado e redeploy o frontend

---

## 15. Problemas Conhecidos e Melhorias Futuras

### 🐛 Problemas Conhecidos

| Problema | Localização | Descrição |
|---|---|---|
| URL do backend hardcoded | `Dashboard.js`, `TicketDetails.js`, `TicketList.js` | A URL `http://localhost:5000` está embutida no código. Em produção, deve usar `REACT_APP_API_URL`. |
| CORS aberto | `server/app.js` | `cors()` sem configuração permite qualquer origem. Em produção, deve ser restrito ao domínio do frontend. |
| NavBar sem responsividade mobile | `NavBar.js` | O menu de navegação some em telas pequenas (`hidden sm:flex`) sem um menu hambúrguer. |

### ✅ Melhorias Já Implementadas

| Melhoria | Descrição |
|---|---|
| Tradução de `MyTickets.js` | Toda a UI estava em inglês; agora está em português como o resto do sistema. |
| Bug em `AuthContext.js` | No evento `SIGNED_OUT`, o `role` era incorretamente definido como `'customer'` em vez de `null`, podendo causar redirecionamentos errados. |
| Dashboard com card duplicado | O card "Categoria Principal" aparecia duas vezes e havia uma grade vazia. Ambos foram removidos. |
| `render.yaml` configurado | O arquivo estava vazio; agora possui configuração completa de deploy. |
| `server/package.json` | Adicionado script `dev` com `nodemon` para hot-reload durante desenvolvimento. |

### 🚀 Roadmap — Melhorias Futuras

| Prioridade | Melhoria |
|---|---|
| 🔴 Alta | Substituir URL hardcoded do backend por variável de ambiente |
| 🔴 Alta | Restringir CORS para o domínio de produção |
| 🟡 Média | Menu hambúrguer para mobile na NavBar |
| 🟡 Média | Notificações por e-mail ao receber comentários |
| 🟡 Média | Atualização automática do Dashboard (polling ou WebSocket) |
| 🟢 Baixa | Filtros por período no Dashboard (a lógica existe mas o filtro `startDate` não é aplicado na query) |
| 🟢 Baixa | Testes automatizados (Jest + React Testing Library) |
| 🟢 Baixa | Paginação na `TicketList` para grandes volumes de dados |

---

*Este documento foi gerado em Março de 2026 e representa o estado atual do projeto.*

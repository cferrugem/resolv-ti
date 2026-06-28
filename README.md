# ResolvTI 🚀

> **Portal de soluções e gerenciamento de chamados de TI (Helpdesk / Servicedesk)**

O **ResolvTI** é uma aplicação web full-stack para abertura, acompanhamento e resolução de chamados de suporte técnico. Ele centraliza a comunicação entre clientes e equipe técnica, organiza o fluxo de atendimento por status e prioridade, e oferece um dashboard com métricas para a equipe de suporte.

> 📚 Projeto desenvolvido como portfólio/estudo. Consulte [DOCUMENTACAO.md](DOCUMENTACAO.md) para detalhes técnicos aprofundados.

---

## ✨ Funcionalidades

- **Autenticação por perfil (role-based):** a interface se adapta conforme o usuário seja **Cliente** (customer) ou **Técnico** (staff).
- **Gestão completa de chamados:** abertura, mudança de status (Aberto, Em Andamento, Fechado), definição de prioridade (Alta, Média, Baixa) e categorização (Hardware, Software, Rede, etc.).
- **Comentários por chamado:** histórico de comunicação registrado dentro de cada ticket.
- **Dashboard de métricas (Chart.js):** tendência de abertura de chamados, tempo médio de resposta, desempenho por técnico e categorias mais frequentes.
- **Interface responsiva:** design mobile-first com suporte a modo escuro, construído com Tailwind CSS.

---

## 🛠️ Stack

### Frontend (`/client`)
- **React 19** — interface SPA
- **React Router 7** — roteamento no cliente
- **Tailwind CSS** — estilização responsiva
- **TanStack Query** — gerenciamento de estado assíncrono e cache
- **Chart.js / react-chartjs-2** — gráficos do dashboard
- **Framer Motion** — animações

### Backend (`/server`)
- **Node.js + Express 5** — API RESTful
- **TypeScript** (executado via `tsx`)
- **Prisma ORM 5** com adaptador **LibSQL** — modelagem e acesso ao banco
- **Zod** — validação de schemas
- **Supabase JS** — cliente auxiliar de dados/auth

### Banco de dados e infraestrutura
- **Turso (LibSQL)** — banco SQLite distribuído (edge) em produção
- **SQLite local** — para desenvolvimento
- **Render** — hospedagem da API (web service) e do frontend (static site), ver [`render.yaml`](render.yaml)

> 💡 O backend possui um **modo mock** (`USE_MOCK_DB` / `REACT_APP_USE_MOCK`) que permite rodar a aplicação sem um banco real configurado — útil para testes rápidos e demonstrações.

---

## 📁 Estrutura do projeto

```
resolv-ti/
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes de UI
│       ├── hooks/       # Hooks customizados (useTickets, useDebounce)
│       └── pages/       # Telas (Dashboard, MyTickets, TicketList, ...)
├── server/              # Backend Express + TypeScript
│   ├── routes/          # Rotas (tickets, comments) + variantes mock
│   ├── middleware/      # auth, ownership
│   ├── schemas/         # Schemas Zod
│   └── prisma/          # schema.prisma
└── render.yaml          # Infra como código (Render)
```

---

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [Git](https://git-scm.com/)

### 1. Clonar e instalar dependências
```bash
git clone https://github.com/cferrugem/resolv-ti.git
cd resolv-ti

# Backend
cd server
npm install

# Frontend (em outro terminal)
cd ../client
npm install --legacy-peer-deps
```

### 2. Configurar variáveis de ambiente
Cada parte possui um arquivo `.env.example` como referência. Copie e preencha:

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env.local
```

Para começar **sem configurar serviços externos**, basta deixar o modo mock ativo:
- `server/.env` → `USE_MOCK_DB=true`
- `client/.env.local` → `REACT_APP_USE_MOCK=true`

### 3. (Opcional) Inicializar o banco local
Pulável se estiver usando o modo mock. Na pasta `server/`:
```bash
npx prisma db push   # cria as tabelas no SQLite local
npx tsx seed.ts      # popula com dados fictícios
```

> **Dica de login (após o seed):** `staff@resolv.com` (Técnico) ou `joao@empresa.com` (Cliente), senha `senha123`.

### 4. Iniciar a aplicação
```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

A aplicação ficará disponível em **http://localhost:3000** e a API em **http://localhost:5000**.

---

## 🔒 Segurança

Este projeto foi concebido para fins de **portfólio e estudo**. Antes de qualquer uso em produção, observe:

- As senhas de demonstração **não usam hash** — implemente **bcrypt** (ou similar).
- A camada de dados atua como proxy **sem Row Level Security** — configure RLS e/ou autenticação por **JWT** com validação nas rotas do Express.
- **Nunca** versione segredos. As variáveis sensíveis ficam em `.env` / `.env.local` (já cobertos pelo `.gitignore`); use apenas os arquivos `.env.example` como referência pública.

---

## 👥 Autores

- Cleiton Ferrugem
- Lucas Gades

---

## 📄 Licença

Distribuído sob a licença ISC.

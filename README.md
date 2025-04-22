# ResolvTI - Sistema de Gestão de Tickets de Suporte

## 📋 Sobre o Projeto
ResolvTI é uma plataforma de suporte técnico que permite gerenciar tickets de forma eficiente, facilitando a comunicação entre usuários e equipe de suporte.

## ✨ Funcionalidades
- Autenticação de usuários
- Criação e gerenciamento de tickets
- Sistema de comentários
- Atribuição de tickets para staff
- Acompanhamento de status
- Dashboard para equipe de suporte
- Interface responsiva

## 🚀 Tecnologias Utilizadas
- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express
- Banco de Dados: Supabase
- Autenticação: Supabase Auth

## 🔧 Pré-requisitos
- Node.js (v14 ou superior)
- NPM ou Yarn
- Conta no Supabase (https://supabase.com)

## ⚙️ Configuração do Ambiente

### 1. Clone o Repositório
```bash
git clone [url-do-repositório]
cd resolvti
```

### 2. Configuração do Backend
```bash
# Navegue até a pasta do servidor
cd server

# Instale as dependências
npm install
```

### 3. Configuração do Frontend
```bash
# Navegue até a pasta do cliente
cd client

# Instale as dependências
npm install
```

## 🚀 Executando o Projeto

1. **Inicie o Servidor**
```bash
cd server
npm run dev
```

2. **Inicie o Cliente** (em outro terminal)
```bash
cd client
npm run dev
```

3. Acesse a aplicação em `http://localhost:3000`




#PENSAR MUITO BEM ANTES DE EXECUTAR OS SEGUINTES COMANDOS
## 🗄️ Configuração do Banco de Dados

Execute no SQL Editor do Supabase:

```sql
-- Crie a tabela de usuários
create table users (
  id uuid references auth.users primary key,
  role text check (role in ('staff', 'customer')) not null default 'customer'
);

-- Crie a tabela de tickets
create table tickets (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text check (status in ('open', 'in progress', 'closed')) default 'open',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  user_id uuid references users not null,
  assigned_to uuid references users,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Crie a tabela de comentários
create table ticket_comments (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references tickets not null,
  user_id uuid references users not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## 🔐 Políticas de Segurança (RLS)

Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS
alter table users enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;

-- Políticas para tickets
create policy "Users can view their own tickets"
on tickets for select
to authenticated
using (
  user_id = auth.uid() or 
  exists (
    select 1 from users
    where users.id = auth.uid()
    and users.role = 'staff'
  )
);

-- Políticas para comentários
create policy "Users can view comments on their tickets"
on ticket_comments for select
to authenticated
using (
  exists (
    select 1 from tickets
    where tickets.id = ticket_comments.ticket_id
    and (tickets.user_id = auth.uid() or exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'staff'
    ))
  )
);
```



## 👥 Criando Usuários

1. Registre-se através da interface da aplicação
2. Para criar um usuário staff, execute no SQL Editor do Supabase:
```sql
UPDATE users 
SET role = 'staff' 
WHERE id = 'id_do_usuário';
```

## 🔍 Funcionalidades

### Para Clientes:
- Criar tickets de suporte
- Acompanhar status dos tickets
- Adicionar comentários
- Visualizar histórico de tickets

### Para Staff:
- Visualizar todos os tickets
- Atribuir tickets para si ou outros membros
- Atualizar status dos tickets
- Responder tickets
- Acessar dashboard com métricas

## 🐛 Solução de Problemas Comuns

### Erro de CORS
- Verifique se o servidor está rodando
- Confirme as configurações de CORS no servidor

### Erro de Autenticação
- Verifique as variáveis de ambiente
- Confirme se as chaves do Supabase estão corretas

### Problemas de Permissão
- Verifique as políticas RLS no Supabase
- Confirme se o usuário tem o papel correto (staff/customer)

## 📄 Licença
Este projeto está sob a licença MIT.

## 🤝 Contribuindo
Pull requests são bem-vindos. Para mudanças importantes, abra uma issue primeiro para discutir o que você gostaria de mudar.

## 📨 Suporte
Para suporte, envie um email para [seu-email]

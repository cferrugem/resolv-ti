# 🛠️ ResolvTI

## Sistema de Gestão de Tickets de Suporte
Uma plataforma moderna para gerenciamento eficiente de suporte técnico

## 📋 Visão Geral

ResolvTI é uma plataforma completa de gestão de suporte técnico desenvolvida com tecnologias modernas para facilitar o gerenciamento de chamados de TI. O sistema permite a criação, acompanhamento e resolução de tickets de suporte, estabelecendo um canal de comunicação eficiente entre usuários que necessitam de assistência e a equipe técnica responsável pela resolução dos problemas.

A aplicação utiliza uma arquitetura cliente-servidor, com o frontend desenvolvido em React e estilizado com Tailwind CSS, proporcionando uma interface responsiva, intuitiva e visualmente atraente. No backend, a aplicação é suportada por Node.js e Express, que facilitam a criação de APIs RESTful para comunicação com o banco de dados PostgreSQL hospedado na plataforma Supabase.

O ResolvTI implementa um sistema de autenticação robusto usando JWT (JSON Web Tokens) e as funcionalidades de autenticação do Supabase, garantindo que apenas usuários autorizados possam acessar as funcionalidades do sistema conforme seu nível de permissão (cliente ou staff). Além disso, o sistema utiliza Row Level Security (RLS) no banco de dados para garantir a segurança e privacidade dos dados.

## 🧠 Conceitos Técnicos

### Arquitetura da Aplicação

O ResolvTI segue uma arquitetura de três camadas, projetada para promover escalabilidade, manutenção e segurança:

#### Camada de Apresentação (Frontend):
* **React.js**: Biblioteca para construção de interfaces de usuário componentizadas, garantindo alta performance e reatividade.
* **Tailwind CSS**: Framework utilitário para estilização rápida e responsiva, permitindo design moderno sem CSS personalizado extenso.
* **Context API**: Gerenciamento de estado global para autenticação e dados do usuário, reduzindo a complexidade de passagem de props.
* **React Router**: Sistema de roteamento dinâmico para navegação fluida entre páginas, com suporte a rotas protegidas.
* **Framer Motion**: Biblioteca para animações suaves, melhorando a experiência do usuário.
* **Chart.js**: Visualização de dados em gráficos interativos, utilizada no dashboard da equipe de suporte.

#### Camada de Aplicação (Backend):
* **Node.js com Express**: Framework para criação de APIs RESTful rápidas e escaláveis, com suporte a middlewares.
* **Middleware Personalizado**: Autenticação, validação de dados e tratamento de erros centralizado para consistência.
* **REST API**: Endpoints bem definidos para operações CRUD (Create, Read, Update, Delete) em tickets e comentários.
* **CORS Configurado**: Segurança para permitir apenas requisições de origens autorizadas.

#### Camada de Dados:
* **Supabase com PostgreSQL**: Banco de dados relacional hospedado com suporte a escalabilidade e alta disponibilidade.
* **Row Level Security (RLS)**: Políticas de segurança granular no nível de linha para proteger dados sensíveis.
* **Funções RPC**: Operações complexas encapsuladas no banco de dados para maior eficiência.
* **Relacionamentos entre Tabelas**: Chaves estrangeiras garantem integridade referencial entre usuários, tickets e comentários.

### Fluxo de Autenticação

O ResolvTI utiliza um fluxo de autenticação seguro baseado em JWT:

1. O usuário fornece credenciais (email e senha) no frontend.
2. O Supabase autentica as credenciais e retorna um token JWT com informações do usuário.
3. O token é armazenado localmente no cliente (localStorage ou cookies seguros) e incluído nos cabeçalhos de autorização (Bearer Token) em todas as requisições protegidas.
4. O backend valida o token em cada requisição usando a chave secreta configurada.
5. Com base no papel do usuário (customer ou staff), o sistema libera acesso aos recursos correspondentes.
6. Tokens possuem tempo de expiração configurável, exigindo renovação periódica para manter a sessão ativa.

### Sistema de Permissões

O controle de acesso é implementado em três níveis para garantir segurança e usabilidade:

#### Frontend:
* **Rotas Protegidas**: Componente RequireAuth verifica a existência de um token válido e o papel do usuário antes de renderizar páginas sensíveis.
* **Renderização Condicional**: Elementos da interface (como botões de administração) são exibidos apenas para usuários com permissões adequadas.

#### Backend:
* **Validação de Token**: Middleware de autenticação verifica a validade do JWT e extrai informações do usuário.
* **Verificação de Permissões**: Antes de processar requisições, o backend confirma se o usuário tem o papel necessário (ex.: staff para gerenciar tickets).

#### Banco de Dados:
* **Políticas RLS**: Garantem que usuários só acessem dados autorizados (ex.: clientes veem apenas seus próprios tickets).
* **Consultas Seguras**: Uso de prepared statements e validação de entrada para prevenir injeção SQL.

Este sistema multicamadas assegura que os dados permaneçam protegidos e que as ações dos usuários sejam restritas às suas permissões.

### Escalabilidade e Performance

Para suportar um número crescente de usuários e tickets, o ResolvTI incorpora práticas que favorecem escalabilidade:

* **Cache de Consultas**: O Supabase suporta cache interno para consultas frequentes, reduzindo a carga no banco de dados.
* **Paginação**: Listas de tickets utilizam paginação para minimizar o uso de recursos em grandes conjuntos de dados.
* **Assincronicidade**: Operações de I/O no backend são assíncronas, evitando gargalos.
* **Índices no Banco de Dados**: Índices em colunas frequentemente consultadas (ex.: user_id, status) para otimizar consultas.

## ✨ Funcionalidades Principais

| Para Clientes | Para Equipe de Suporte |
|---------------|------------------------|
| ✅ Criação de chamados com diferentes níveis de prioridade | ✅ Dashboard com métricas e estatísticas em tempo real |
| ✅ Acompanhamento detalhado do status dos chamados | ✅ Visualização centralizada de todos os tickets do sistema |
| ✅ Histórico completo de solicitações | ✅ Sistema de atribuição de tickets para membros da equipe |
| ✅ Sistema de comentários para comunicação com a equipe de suporte | ✅ Gerenciamento de prioridades baseado em critérios técnicos |
| ✅ Interface intuitiva com feedback visual | ✅ Análise de desempenho e eficiência da equipe |
| ✅ Notificações sobre mudanças no status dos chamados | ✅ Filtros avançados para organização dos tickets |

## 🚀 Tecnologias Utilizadas

### Frontend
* React.js (17.0.2+)
* Tailwind CSS para UI responsiva
* Context API para gerenciamento de estado
* React Router para navegação
* Chart.js para visualização de dados
* Framer Motion para animações

### Backend
* Node.js (14.0.0+)
* Express para APIs RESTful
* Middleware personalizado
* Sistema de validação de dados
* Tratamento de erros centralizado
* CORS configurado para segurança

### Banco de Dados/Auth
* Supabase como plataforma BaaS
* PostgreSQL para persistência
* Autenticação JWT segura
* Row Level Security (RLS)
* Funções RPC personalizadas
* Políticas de segurança granulares

  ## 🆚 Comparativo Profissional: ResolvTI vs. GLPI, Freshdesk e Zendesk

| Critério                       | **ResolvTI**                         | **GLPI**                        | **Freshdesk**                 | **Zendesk**                  |
|--------------------------------|--------------------------------------|---------------------------------|-------------------------------|------------------------------|
| **Interface**                  | Moderna, minimalista e intuitiva     | Tradicional e densa             | Moderna, orientada ao usuário | Moderna, corporativa         |
| **Implantação**                | Rápida (cloud ou local)              | Complexa (infraestrutura própria)| 100% Cloud, fácil             | 100% Cloud, fácil            |
| **Customização**               | Total, código aberto                 | Alta, via plugins/scripts       | Limitada, requer planos pagos | Média, exige plano avançado  |
| **Custo**                      | Gratuito (open source)               | Gratuito, manutenção cara       | Pago (plano gratuito limitado)| Pago (plano gratuito limitado)|
| **Foco de Uso**                | Essencial, sob medida                | Corporativo, multi-módulo       | Corporativo, multi-módulo     | Corporativo, multi-módulo    |
| **Usabilidade**                | Intuitiva para qualquer usuário      | Curva de aprendizado acentuada  | Fácil, mas menus extensos     | Fácil, menus avançados       |
| **Acompanhamento de Chamados** | Transparente e simplificado          | Avançado, porém complexo        | Completo, porém genérico      | Completo, porém genérico     |
| **Notificações**               | Diretas e configuráveis              | E-mail, SMS, plugins            | E-mail, app, WhatsApp         | E-mail, app, WhatsApp        |
| **Adaptação ao Cliente**       | Total, desenvolvimento sob demanda   | Baixa, solução genérica         | Parcial, depende do plano     | Parcial, depende do plano    |
| **Segurança**                  | JWT, RLS, Supabase                   | LDAP, permissões avançadas      | Padrão de mercado             | Padrão de mercado            |
| **Requisitos de Sistema**      | Leves (stack moderna)                | Altos (infraestrutura robusta)  | Apenas conexão com internet   | Apenas conexão com internet  |

**Figura 1 – Comparativo profissional entre ResolvTI, GLPI, Freshdesk e Zendesk. Destaque para a simplicidade, adaptabilidade e custo zero do ResolvTI frente aos principais sistemas do mercado.**

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* Node.js (v14 ou superior)
* NPM ou Yarn
* Git
* Conta no Supabase

## ⚙️ Configuração e Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/resolv-ti.git
cd resolv-ti
```

### 2. Configuração do Supabase

1. Acesse Supabase e crie uma conta gratuita.
2. Crie um novo projeto e anote as credenciais (URL e chave anônima).
3. No SQL Editor, execute os seguintes comandos para configurar o banco de dados:

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

-- Habilitar RLS (Row Level Security)
alter table users enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;

-- Políticas para tickets
create policy "Usuários podem ver seus próprios tickets"
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
create policy "Usuários podem ver comentários em seus tickets"
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

### 3. Configuração do Backend

```bash
# Navegue até a pasta do servidor
cd server

# Instale as dependências
npm install

# Crie um arquivo .env com base no exemplo
cp .env.example .env
```

Edite o arquivo .env com suas credenciais do Supabase:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
JWT_SECRET=chave_secreta_para_jwt
PORT=5000
```

### 4. Configuração do Frontend

```bash
# Navegue até a pasta do cliente
cd ../client

# Instale as dependências
npm install

# Crie um arquivo .env com base no exemplo
cp .env.example .env
```

Edite o arquivo .env com suas credenciais do Supabase:

```
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
REACT_APP_API_URL=http://localhost:5000
```

### 5. Gere os arquivos CSS do Tailwind

```bash
cd client
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

## 🚀 Executando o Projeto

### 1. Inicie o Servidor Backend

```bash
cd server
npm run dev
```

O servidor será iniciado na porta 5000 (ou na porta definida em seu arquivo .env).

### 2. Inicie o Cliente Frontend (em outro terminal)

```bash
cd client
npm start
```

O aplicativo React será iniciado na porta 3000. Acesse http://localhost:3000 no seu navegador.

## 👥 Tipos de Usuário e Permissões

### Clientes

Os usuários com papel customer podem:

* Criar novos tickets com diferentes níveis de prioridade.
* Visualizar e comentar em seus próprios tickets.
* Acompanhar o status de seus tickets em tempo real.
* Filtrar e pesquisar em sua lista de tickets.
* Receber feedback claro sobre o progresso de suas solicitações.
* Comunicar-se diretamente com a equipe de suporte via comentários.

### Equipe de Suporte (Staff)

Os usuários com papel staff podem:

* Visualizar todos os tickets do sistema em uma interface unificada.
* Atribuir tickets a si mesmos ou a outros membros da equipe.
* Alterar o status e a prioridade dos tickets conforme necessário.
* Comentar em qualquer ticket para fornecer atualizações ou solicitar informações.
* Acessar o dashboard com métricas e estatísticas para análise de desempenho.
* Utilizar filtros avançados para organizar e gerenciar os tickets.
* Excluir tickets quando apropriado (com confirmação de segurança).

## 📱 Guia de Uso

### Para Clientes

#### Registrando-se no Sistema

1. Acesse a página inicial e clique em "Registrar".
2. Preencha seus dados (nome, email e senha).
3. Você será automaticamente registrado como um usuário do tipo customer.
4. Confirme seu email se necessário (depende da configuração do Supabase).

#### Criando um Novo Ticket

1. Após fazer login, acesse "Meus Tickets".
2. Clique no botão "Criar Novo Ticket".
3. Preencha o título e forneça uma descrição detalhada do problema.
4. Selecione a prioridade adequada:
   * **Baixa**: Problemas que não afetam diretamente o trabalho.
   * **Média**: Problemas que dificultam, mas não impedem o trabalho.
   * **Alta**: Problemas críticos que impedem completamente o trabalho.
5. Clique em "Enviar" para criar o ticket.

#### Acompanhando seus Tickets

1. Acesse "Meus Tickets" para ver a lista de todas as suas solicitações.
2. Use os filtros para encontrar tickets específicos (por status, data, etc.).
3. Clique em um ticket para ver seus detalhes completos.
4. Na página de detalhes, você pode:
   * Ver o histórico completo do ticket.
   * Adicionar comentários para fornecer mais informações.
   * Acompanhar as atualizações da equipe de suporte.
   * Ver quando seu ticket será resolvido (se informado).

### Para Equipe de Suporte

#### Tornando-se um Usuário Staff

Para promover um usuário comum a administrador, execute este comando SQL no Supabase:

```sql
-- Primeiro, encontre o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'email_do_usuario@exemplo.com';

-- Depois, promova o usuário para staff
UPDATE users 
SET role = 'staff' 
WHERE id = 'id_do_usuário_obtido';
```

#### Acessando o Dashboard

1. Após fazer login como staff, você será direcionado ao Dashboard.
2. O Dashboard apresenta:
   * Gráficos de distribuição de tickets por status e prioridade.
   * Métricas de tempo médio de resolução.
   * Lista dos tickets mais recentes que precisam de atenção.
   * Indicadores de desempenho da equipe.

#### Gerenciando Tickets

1. No menu lateral, acesse "Todos os Tickets" para ver todas as solicitações.
2. Use os filtros avançados para organizar tickets por:
   * Status (aberto, em andamento, fechado).
   * Prioridade (baixa, média, alta).
   * Data de criação.
   * Atribuição (tickets atribuídos a você ou não atribuídos).
3. Clique em um ticket para ver seus detalhes e gerenciá-lo.

#### Atribuindo Tickets

1. Na lista de tickets ou na página de detalhes do ticket.
2. Use o menu dropdown "Atribuir para" para selecionar um membro da equipe.
3. O ticket será imediatamente atribuído ao membro selecionado.
4. O sistema registra automaticamente quando e por quem o ticket foi atribuído.

#### Alterando Status de Tickets

1. Na página de detalhes do ticket ou na lista de tickets.
2. Use o menu dropdown de status para alterar entre:
   * Aberto (recém-criado).
   * Em Andamento (sendo trabalhado).
   * Fechado (resolvido).
3. Cada mudança de status é registrada no histórico do ticket.
4. Ao fechar um ticket, considere adicionar um comentário final explicando a resolução.

## 🔍 Estrutura do Projeto

```
resolv-ti/
├── client/               # Frontend em React
│   ├── public/           # Arquivos estáticos
│   │   ├── index.html    # Template HTML principal
│   │   ├── fav.png       # Favicon do sistema
│   │   └── output.css    # CSS compilado do Tailwind
│   └── src/              # Código fonte React
│       ├── components/   # Componentes reutilizáveis
│       │   ├── CreateTicket.js    # Formulário de criação de tickets
│       │   ├── Login.js           # Formulário de login
│       │   ├── NavBar.js          # Barra de navegação
│       │   ├── PageContainer.js   # Container das páginas
│       │   ├── Register.js        # Formulário de registro
│       │   └── RequireAuth.js     # Componente de proteção de rotas
│       ├── pages/        # Páginas da aplicação
│       │   ├── Dashboard.js       # Dashboard para staff
│       │   ├── MyTickets.js       # Lista de tickets do usuário
│       │   ├── TicketDetails.js   # Detalhes do ticket
│       │   └── AllTickets.js      # Lista de todos os tickets (staff)
│       ├── AuthContext.js # Contexto de autenticação
│       ├── supabase.js   # Configuração do Supabase
│       ├── App.js        # Componente principal
│       ├── index.js      # Ponto de entrada da aplicação
│       └── input.css     # Arquivo fonte do Tailwind
├── server/               # Backend em Node.js
│   ├── routes/           # Rotas da API
│   │   ├── tickets.js    # Endpoints para tickets
│   │   └── comments.js   # Endpoints para comentários
│   ├── middlewares/      # Middlewares personalizados
│   │   └── auth.js       # Middleware de autenticação
│   ├── app.js            # Aplicação Express
│   ├── package.json      # Dependências do servidor
│   └── .env              # Variáveis de ambiente
└── README.md             # Documentação
```

## 🛡️ Segurança e Boas Práticas

O ResolvTI implementa diversas medidas de segurança e segue boas práticas de desenvolvimento:

### Autenticação Segura
* Utilizamos JWT para autenticação stateless.
* Os tokens têm tempo de expiração limitado.
* Senhas são armazenadas com hash seguro via Supabase.

### Proteção de Dados
* Row Level Security no banco de dados.
* Sanitização de entradas para prevenir injeção SQL.
* Validação de dados em múltiplas camadas.

### Segurança Frontend
* Content Security Policy (CSP) configurada.
* Proteção contra Cross-Site Scripting (XSS).
* Rotas protegidas com RequireAuth.

### Boas Práticas de API
* Respostas de erro consistentes.
* Validação de parâmetros de requisição.
* Logs detalhados para depuração.

### Estrutura de Código
* Componentes React modulares e reutilizáveis.
* Separação clara de responsabilidades.
* Uso de Context API para gerenciamento de estado.

## 🐛 Solução de Problemas Comuns

### Erro de Autenticação

**Problema**: Mensagem "No authentication session found" ou falha ao fazer login.

**Solução**:
* Verifique se as credenciais do Supabase estão corretas nos arquivos .env.
* Certifique-se de que o Supabase está configurado corretamente com as tabelas e políticas.
* Limpe os cookies do navegador e tente novamente.
* Verifique os logs do console para identificar o erro específico.
* Confirme que o email utilizado foi verificado (se a verificação de email estiver ativada).

### Erro de CORS

**Problema**: Erros de CORS ao fazer requisições do frontend para o backend.

**Solução**:
* Verifique se a URL da API está correta no arquivo .env do frontend.
* Certifique-se de que o backend está rodando e acessível.
* Confirme se o middleware CORS está configurado corretamente no servidor.
* Verifique se o cabeçalho Content-Type está definido corretamente nas requisições.
* Certifique-se de que a política CSP no HTML permite as conexões necessárias.

### Problemas com Permissões

**Problema**: Erro "Não autorizado" ao tentar acessar recursos.

**Solução**:
* Verifique se o usuário possui o papel correto (staff ou customer).
* Certifique-se que as políticas RLS no Supabase estão configuradas corretamente.
* Faça logout e login novamente para atualizar o token JWT.
* Verifique se o token está sendo enviado corretamente nos cabeçalhos de autorização.
* Confirme que o usuário existe na tabela users com o ID correto.

### Problema ao Criar ou Atualizar Tickets

**Problema**: Erros ao tentar criar ou atualizar tickets.

**Solução**:
* Verifique os logs do console para identificar o erro específico.
* Certifique-se de que todos os campos obrigatórios estão preenchidos.
* Verifique se o banco de dados está acessível e se as tabelas têm as colunas corretas.
* Confirme que os valores inseridos respeitam as restrições de tipo e formato.
* Verifique se há restrições de RLS impedindo a operação.

### CSS não Carregando Corretamente

**Problema**: A estilização Tailwind não está sendo aplicada.

**Solução**:
* Certifique-se de que o arquivo output.css foi gerado corretamente.
* Verifique se o comando para compilar o Tailwind está em execução.
* Confirme que o arquivo CSS está sendo importado corretamente.
* Limpe o cache do navegador.
* Verifique se há erros no console relacionados ao CSS.

## 📈 Melhorias Futuras

O ResolvTI pode ser expandido com recursos adicionais como:

* **Sistema de notificações**: Para alertar sobre novos comentários ou mudanças de status, com notificações push e por email.
* **Integração com email**: Para enviar atualizações automáticas aos usuários quando houver mudanças em seus tickets.
* **Base de conhecimento**: Para documentar soluções comuns, permitindo autoatendimento para problemas recorrentes.
* **Automações e regras**: Para atribuição automática de tickets baseada em categorias, carga de trabalho e especialidades.
* **Aplicativo móvel**: Desenvolvido com React Native para acesso em qualquer lugar, com notificações push.
* **Integração com chat**: Para suporte em tempo real, possivelmente com chatbot para triagem inicial.
* **Métricas avançadas**: Com análise preditiva para identificar tendências e otimizar o atendimento.
* **Integração com serviços externos**: Como JIRA, Slack, ou Microsoft Teams.
* **Sistema de avaliação**: Para feedback dos usuários sobre a qualidade do atendimento.
* **Modo escuro**: Para melhor experiência visual em diferentes condições de iluminação.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para obter mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto.
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`).
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`).
4. Envie para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

### Diretrizes para Contribuição

* Siga o padrão de código existente.
* Adicione testes para novas funcionalidades.
* Atualize a documentação conforme necessário.
* Certifique-se de que todos os testes passam antes de enviar.

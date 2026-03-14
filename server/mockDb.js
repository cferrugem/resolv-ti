/**
 * mockDb.js — In-memory database for development without Supabase.
 *
 * This module exports a shared in-memory store that replaces the Supabase
 * PostgreSQL database while the real database is offline.
 *
 * Data is reset every time the server restarts. To persist data across
 * restarts, save/load from a JSON file (see TODO at the bottom).
 *
 * Users available for login (frontend mock):
 *   staff@resolv.com    / senha123   → role: staff
 *   tecnico@resolv.com  / senha123   → role: staff
 *   joao@empresa.com    / senha123   → role: customer
 *   maria@empresa.com   / senha123   → role: customer
 *   pedro@empresa.com   / senha123   → role: customer
 */

// ─── Static IDs ──────────────────────────────────────────────────────────────
export const USERS = {
  staff1:   'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
  staff2:   'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
  client1:  'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
  client2:  'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
  client3:  'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb',
};

// Helper: generate a UUID v4-like string
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper: ISO timestamp N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
export const db = {
  users: [
    { id: USERS.staff1,  email: 'staff@resolv.com',    role: 'staff',    password: 'senha123' },
    { id: USERS.staff2,  email: 'tecnico@resolv.com',  role: 'staff',    password: 'senha123' },
    { id: USERS.client1, email: 'joao@empresa.com',    role: 'customer', password: 'senha123' },
    { id: USERS.client2, email: 'maria@empresa.com',   role: 'customer', password: 'senha123' },
    { id: USERS.client3, email: 'pedro@empresa.com',   role: 'customer', password: 'senha123' },
  ],

  tickets: [
    {
      id: 'ticket-0001-0001-0001-000000000001',
      title: 'Computador não liga',
      description: 'Ao pressionar o botão liga/desliga, nada acontece. Sem LEDs, sem som. Problema iniciou hoje de manhã.',
      status: 'open',
      priority: 'high',
      category: 'hardware',
      user_id: USERS.client1,
      assigned_to: USERS.staff1,
      created_at: daysAgo(2),
      updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0002-0002-0002-000000000002',
      title: 'Impressora não imprime em rede',
      description: 'A impressora HP LaserJet do setor financeiro parou de aceitar trabalhos enviados via rede. Impressão local funciona normalmente.',
      status: 'in progress',
      priority: 'medium',
      category: 'impressora',
      user_id: USERS.client2,
      assigned_to: USERS.staff2,
      created_at: daysAgo(5),
      updated_at: daysAgo(3),
    },
    {
      id: 'ticket-0003-0003-0003-000000000003',
      title: 'VPN não conecta após atualização',
      description: 'Após a atualização do Windows 11 (23H2), a VPN corporativa retorna erro "Credenciais inválidas" mesmo com a senha correta.',
      status: 'open',
      priority: 'high',
      category: 'rede',
      user_id: USERS.client3,
      assigned_to: null,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0004-0004-0004-000000000004',
      title: 'Outlook não sincroniza e-mails',
      description: 'O Microsoft Outlook (versão 365) trava ao tentar sincronizar a caixa de entrada. Já tentei reiniciar sem sucesso.',
      status: 'closed',
      priority: 'medium',
      category: 'email',
      user_id: USERS.client1,
      assigned_to: USERS.staff1,
      created_at: daysAgo(10),
      updated_at: daysAgo(7),
    },
    {
      id: 'ticket-0005-0005-0005-000000000005',
      title: 'Erro 403 no sistema de ponto',
      description: 'Ao acessar o sistema de registro de ponto eletrônico, aparece Erro 403 Forbidden para todos os usuários do RH desde ontem.',
      status: 'in progress',
      priority: 'high',
      category: 'sistemas',
      user_id: USERS.client2,
      assigned_to: USERS.staff1,
      created_at: daysAgo(3),
      updated_at: daysAgo(2),
    },
    {
      id: 'ticket-0006-0006-0006-000000000006',
      title: 'Teclado com teclas travando',
      description: 'O teclado da estação de trabalho 14B apresenta as teclas "e", "r" e "t" travando frequentemente. Suspeita de problema mecânico.',
      status: 'open',
      priority: 'low',
      category: 'hardware',
      user_id: USERS.client3,
      assigned_to: null,
      created_at: daysAgo(4),
      updated_at: daysAgo(4),
    },
    {
      id: 'ticket-0007-0007-0007-000000000007',
      title: 'Antivírus expirado em 8 máquinas',
      description: 'O Kaspersky Endpoint em 8 máquinas do setor jurídico está com licença expirada. Necessário renovação urgente para conformidade de segurança.',
      status: 'open',
      priority: 'high',
      category: 'seguranca',
      user_id: USERS.client1,
      assigned_to: USERS.staff2,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0008-0008-0008-000000000008',
      title: 'Não consigo resetar minha senha',
      description: 'Tentei usar a opção "Esqueci minha senha" no portal do colaborador mas o e-mail de recuperação não chega. Já verifiquei spam.',
      status: 'closed',
      priority: 'medium',
      category: 'acesso',
      user_id: USERS.client2,
      assigned_to: USERS.staff2,
      created_at: daysAgo(15),
      updated_at: daysAgo(13),
    },
    {
      id: 'ticket-0009-0009-0009-000000000009',
      title: 'Excel travando ao abrir planilhas grandes',
      description: 'O Microsoft Excel 365 trava por 2-3 minutos ao abrir planilhas acima de 10MB. O problema ocorre em minha máquina mas não no notebook de um colega com as mesmas especificações.',
      status: 'open',
      priority: 'medium',
      category: 'software',
      user_id: USERS.client3,
      assigned_to: null,
      created_at: daysAgo(6),
      updated_at: daysAgo(6),
    },
    {
      id: 'ticket-0010-0010-0010-000000000010',
      title: 'Pendrive não reconhecido',
      description: 'O computador não reconhece pendrives USB. Já testei 3 pendrives diferentes. O gerenciador de dispositivos não mostra nenhum dispositivo USB conectado.',
      status: 'closed',
      priority: 'low',
      category: 'hardware',
      user_id: USERS.client1,
      assigned_to: USERS.staff1,
      created_at: daysAgo(20),
      updated_at: daysAgo(18),
    },
  ],

  ticket_comments: [
    {
      id: 'comment-0001',
      ticket_id: 'ticket-0001-0001-0001-000000000001',
      user_id: USERS.staff1,
      comment: 'Recebi o chamado. Vou verificar o equipamento pessoalmente amanhã cedo. Por favor, deixe o computador desconectado da energia até então.',
      created_at: daysAgo(1),
    },
    {
      id: 'comment-0002',
      ticket_id: 'ticket-0001-0001-0001-000000000001',
      user_id: USERS.client1,
      comment: 'Ok, fiz isso. O computador está desconectado. Pode me dizer qual horário irá verificar?',
      created_at: daysAgo(1),
    },
    {
      id: 'comment-0003',
      ticket_id: 'ticket-0002-0002-0002-000000000002',
      user_id: USERS.staff2,
      comment: 'Problema identificado: o IP da impressora mudou após reinicialização do roteador. Estou reconfigurando os computadores do setor para apontar para o novo IP.',
      created_at: daysAgo(3),
    },
    {
      id: 'comment-0004',
      ticket_id: 'ticket-0004-0004-0004-000000000004',
      user_id: USERS.staff1,
      comment: 'Resolvido. O problema era um perfil corrompido do Outlook. Recriei o perfil e importei os dados do arquivo .PST de backup. Verifique se está funcionando.',
      created_at: daysAgo(8),
    },
    {
      id: 'comment-0005',
      ticket_id: 'ticket-0004-0004-0004-000000000004',
      user_id: USERS.client1,
      comment: 'Funcionou! Todos os e-mails estão sincronizando normalmente. Obrigado!',
      created_at: daysAgo(7),
    },
    {
      id: 'comment-0006',
      ticket_id: 'ticket-0005-0005-0005-000000000005',
      user_id: USERS.staff1,
      comment: 'Investigando. O log do servidor de aplicação mostra um problema de permissões após atualização do módulo de autenticação ontem à noite. Trabalhando na correção.',
      created_at: daysAgo(2),
    },
    {
      id: 'comment-0007',
      ticket_id: 'ticket-0008-0008-0008-000000000008',
      user_id: USERS.staff2,
      comment: 'Reset de senha realizado manualmente pelo admin. Enviamos um link temporário para o e-mail corporativo secundário. Por favor, altere sua senha ao primeiro acesso.',
      created_at: daysAgo(13),
    },
    {
      id: 'comment-0008',
      ticket_id: 'ticket-0010-0010-0010-000000000010',
      user_id: USERS.staff1,
      comment: 'Atualização dos drivers USB resolveu o problema. Também habilitamos as portas USB no BIOS que estavam desativadas por política de segurança anterior. Chamado encerrado.',
      created_at: daysAgo(18),
    },
  ],
};

// ─── CRUD helpers ──────────────────────────────────────────────────────────────

/** Returns user by email+password or null */
export function findUserByCredentials(email, password) {
  return db.users.find(u => u.email === email && u.password === password) || null;
}

/** Returns user by id */
export function findUserById(id) {
  return db.users.find(u => u.id === id) || null;
}

/** Returns a ticket with its relations resolved */
export function getTicketWithRelations(ticket) {
  const user  = db.users.find(u => u.id === ticket.user_id);
  const staff = db.users.find(u => u.id === ticket.assigned_to);
  const comments = db.ticket_comments.filter(c => c.ticket_id === ticket.id);
  return {
    ...ticket,
    user:           user  ? { id: user.id,  email: user.email,  role: user.role  } : null,
    assigned_staff: staff ? { id: staff.id, email: staff.email, role: staff.role } : null,
    ticket_comments: comments,
  };
}

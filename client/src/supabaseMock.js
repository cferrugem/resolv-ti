/**
 * supabaseMock.js — Drop-in mock for the Supabase JS client.
 *
 * Implements the same chained-query API that the app uses, backed entirely
 * by an in-memory store. Auth session persists across page reloads via
 * localStorage.
 *
 * ─── Mock credentials ────────────────────────────────────────────────────────
 *  staff@resolv.com    / senha123   → role: staff
 *  tecnico@resolv.com  / senha123   → role: staff
 *  joao@empresa.com    / senha123   → role: customer
 *  maria@empresa.com   / senha123   → role: customer
 *  pedro@empresa.com   / senha123   → role: customer
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Seed data (mirrors server/mockDb.js) ────────────────────────────────────
const USERS = {
  staff1:  'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
  staff2:  'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
  client1: 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
  client2: 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
  client3: 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb',
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── In-memory store ──────────────────────────────────────────────────────────
// Loaded once; survives React re-renders because modules are singletons.
const MOCK_USERS = [
  { id: USERS.staff1,  email: 'staff@resolv.com',    role: 'staff',    password: 'senha123' },
  { id: USERS.staff2,  email: 'tecnico@resolv.com',  role: 'staff',    password: 'senha123' },
  { id: USERS.client1, email: 'joao@empresa.com',    role: 'customer', password: 'senha123' },
  { id: USERS.client2, email: 'maria@empresa.com',   role: 'customer', password: 'senha123' },
  { id: USERS.client3, email: 'pedro@empresa.com',   role: 'customer', password: 'senha123' },
];

const mockStore = {
  users: [...MOCK_USERS],

  tickets: [
    {
      id: 'ticket-0001-0001-0001-000000000001',
      title: 'Computador não liga',
      description: 'Ao pressionar o botão liga/desliga, nada acontece. Sem LEDs, sem som.',
      status: 'open', priority: 'high', category: 'hardware',
      user_id: USERS.client1, assigned_to: USERS.staff1,
      created_at: daysAgo(2), updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0002-0002-0002-000000000002',
      title: 'Impressora não imprime em rede',
      description: 'A impressora HP LaserJet do setor financeiro parou de aceitar trabalhos enviados via rede.',
      status: 'in progress', priority: 'medium', category: 'impressora',
      user_id: USERS.client2, assigned_to: USERS.staff2,
      created_at: daysAgo(5), updated_at: daysAgo(3),
    },
    {
      id: 'ticket-0003-0003-0003-000000000003',
      title: 'VPN não conecta após atualização',
      description: 'Após atualização do Windows 11, a VPN retorna "Credenciais inválidas".',
      status: 'open', priority: 'high', category: 'rede',
      user_id: USERS.client3, assigned_to: null,
      created_at: daysAgo(1), updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0004-0004-0004-000000000004',
      title: 'Outlook não sincroniza e-mails',
      description: 'O Microsoft Outlook (365) trava ao sincronizar a caixa de entrada.',
      status: 'closed', priority: 'medium', category: 'email',
      user_id: USERS.client1, assigned_to: USERS.staff1,
      created_at: daysAgo(10), updated_at: daysAgo(7),
    },
    {
      id: 'ticket-0005-0005-0005-000000000005',
      title: 'Erro 403 no sistema de ponto',
      description: 'Todos os usuários do RH recebem Erro 403. Problema desde ontem.',
      status: 'in progress', priority: 'high', category: 'sistemas',
      user_id: USERS.client2, assigned_to: USERS.staff1,
      created_at: daysAgo(3), updated_at: daysAgo(2),
    },
    {
      id: 'ticket-0006-0006-0006-000000000006',
      title: 'Teclado com teclas travando',
      description: 'As teclas "e", "r" e "t" travam frequentemente na estação 14B.',
      status: 'open', priority: 'low', category: 'hardware',
      user_id: USERS.client3, assigned_to: null,
      created_at: daysAgo(4), updated_at: daysAgo(4),
    },
    {
      id: 'ticket-0007-0007-0007-000000000007',
      title: 'Antivírus expirado em 8 máquinas',
      description: 'Kaspersky expirou em 8 máquinas do jurídico. Renovação urgente necessária.',
      status: 'open', priority: 'high', category: 'seguranca',
      user_id: USERS.client1, assigned_to: USERS.staff2,
      created_at: daysAgo(1), updated_at: daysAgo(1),
    },
    {
      id: 'ticket-0008-0008-0008-000000000008',
      title: 'Não consigo resetar minha senha',
      description: 'O e-mail de recuperação do portal do colaborador não chega.',
      status: 'closed', priority: 'medium', category: 'acesso',
      user_id: USERS.client2, assigned_to: USERS.staff2,
      created_at: daysAgo(15), updated_at: daysAgo(13),
    },
    {
      id: 'ticket-0009-0009-0009-000000000009',
      title: 'Excel travando ao abrir planilhas grandes',
      description: 'Excel 365 trava 2-3 min ao abrir planilhas acima de 10MB.',
      status: 'open', priority: 'medium', category: 'software',
      user_id: USERS.client3, assigned_to: null,
      created_at: daysAgo(6), updated_at: daysAgo(6),
    },
    {
      id: 'ticket-0010-0010-0010-000000000010',
      title: 'Pendrive não reconhecido',
      description: 'Nenhum pendrive USB é reconhecido. Já testei 3 diferentes.',
      status: 'closed', priority: 'low', category: 'hardware',
      user_id: USERS.client1, assigned_to: USERS.staff1,
      created_at: daysAgo(20), updated_at: daysAgo(18),
    },
  ],

  ticket_comments: [
    { id: 'comment-0001', ticket_id: 'ticket-0001-0001-0001-000000000001', user_id: USERS.staff1,  comment: 'Vou verificar o equipamento amanhã cedo. Deixe-o desconectado da energia.', created_at: daysAgo(1) },
    { id: 'comment-0002', ticket_id: 'ticket-0001-0001-0001-000000000001', user_id: USERS.client1, comment: 'Ok, fiz isso. Pode me dizer o horário?', created_at: daysAgo(1) },
    { id: 'comment-0003', ticket_id: 'ticket-0002-0002-0002-000000000002', user_id: USERS.staff2,  comment: 'IP da impressora mudou. Reconfigurando os computadores do setor.', created_at: daysAgo(3) },
    { id: 'comment-0004', ticket_id: 'ticket-0004-0004-0004-000000000004', user_id: USERS.staff1,  comment: 'Resolvido. Perfil corrompido foi recriado. Verifique se está funcionando.', created_at: daysAgo(8) },
    { id: 'comment-0005', ticket_id: 'ticket-0004-0004-0004-000000000004', user_id: USERS.client1, comment: 'Funcionou! Todos os e-mails estão sincronizando. Obrigado!', created_at: daysAgo(7) },
    { id: 'comment-0006', ticket_id: 'ticket-0005-0005-0005-000000000005', user_id: USERS.staff1,  comment: 'Problema de permissões após atualização. Trabalhando na correção.', created_at: daysAgo(2) },
    { id: 'comment-0007', ticket_id: 'ticket-0008-0008-0008-000000000008', user_id: USERS.staff2,  comment: 'Senha resetada manualmente. Link enviado ao e-mail secundário.', created_at: daysAgo(13) },
    { id: 'comment-0008', ticket_id: 'ticket-0010-0010-0010-000000000010', user_id: USERS.staff1,  comment: 'Atualização dos drivers USB resolveu. Chamado encerrado.', created_at: daysAgo(18) },
  ],
};

// ─── Auth state ───────────────────────────────────────────────────────────────
const AUTH_KEY = 'resolv_mock_session';
let _listeners = [];

function _loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function _saveSession(session) {
  if (session) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

function _makeSession(user) {
  // Token = user.id (the mock routes extract user from this)
  return {
    access_token: user.id,
    user: { id: user.id, email: user.email },
  };
}

function _notify(event, session) {
  _listeners.forEach(cb => { try { cb(event, session); } catch {} });
}

// ─── Query Builder ────────────────────────────────────────────────────────────
class QueryBuilder {
  constructor(table) {
    this._table   = table;
    this._filters = [];
    this._order   = null;
    this._op      = 'select';  // select | insert | update | delete
    this._payload = null;      // insert / update data
    this._single  = false;
    this._didSelect = false;
  }

  select(_fields) {
    // Called as part of a chain; keep op unless this is chained after insert/update
    if (this._op === 'insert' || this._op === 'update') {
      this._didSelect = true; // marks that .select() was chained after write
    }
    return this;
  }

  insert(data) {
    this._op      = 'insert';
    this._payload = data;
    return this;
  }

  update(data) {
    this._op      = 'update';
    this._payload = data;
    return this;
  }

  delete() {
    this._op = 'delete';
    return this;
  }

  eq(col, val) {
    this._filters.push({ type: 'eq', col, val });
    return this;
  }

  in(col, vals) {
    this._filters.push({ type: 'in', col, vals });
    return this;
  }

  order(col, opts = {}) {
    this._order = { col, asc: opts.ascending !== false };
    return this;
  }

  single() {
    this._single = true;
    return this._run();
  }

  // Makes the builder thenable so `await builder` works without .single()
  then(resolve, reject) {
    return Promise.resolve(this._run()).then(resolve, reject);
  }

  // ── helpers ──
  _rows() { return mockStore[this._table] || []; }

  _applyFilters(rows) {
    return rows.filter(row =>
      this._filters.every(f => {
        if (f.type === 'eq') return row[f.col] === f.val;
        if (f.type === 'in') return f.vals.includes(row[f.col]);
        return true;
      })
    );
  }

  _withRelations(row) {
    if (this._table !== 'tickets') return row;
    const owner = mockStore.users.find(u => u.id === row.user_id);
    const staff = mockStore.users.find(u => u.id === row.assigned_to);
    const comments = mockStore.ticket_comments.filter(c => c.ticket_id === row.id);
    return {
      ...row,
      user:            owner ? { id: owner.id, email: owner.email, role: owner.role } : null,
      assigned_staff:  staff ? { id: staff.id, email: staff.email, role: staff.role } : null,
      assigned_to_user: staff ? { id: staff.id } : null,
      ticket_comments: comments,
    };
  }

  _run() {
    const table = mockStore[this._table];

    // ── SELECT ──
    if (this._op === 'select') {
      let rows = this._applyFilters([...table]);

      // Attach relations for tickets table
      rows = rows.map(r => this._withRelations(r));

      // Apply ORDER
      if (this._order) {
        const { col, asc } = this._order;
        rows.sort((a, b) => {
          const va = a[col], vb = b[col];
          if (asc)  return va < vb ? -1 : va > vb ? 1 : 0;
          return    va > vb ? -1 : va < vb ? 1 : 0;
        });
      }

      if (this._single) {
        return { data: rows[0] ?? null, error: rows[0] ? null : { message: 'Nenhum registro encontrado', code: 'PGRST116' } };
      }
      return { data: rows, error: null };
    }

    // ── INSERT ──
    if (this._op === 'insert') {
      const items = Array.isArray(this._payload) ? this._payload : [this._payload];
      const now = new Date().toISOString();
      const inserted = items.map(item => {
        const row = { id: genUUID(), created_at: now, updated_at: now, ...item };
        table.push(row);
        return row;
      });
      const result = Array.isArray(this._payload) ? inserted : inserted[0];
      if (this._single) return { data: inserted[0], error: null };
      return { data: result, error: null };
    }

    // ── UPDATE ──
    if (this._op === 'update') {
      const toUpdate = this._applyFilters(table);
      toUpdate.forEach(row => Object.assign(row, this._payload, { updated_at: new Date().toISOString() }));
      const result = toUpdate[0] ?? null;
      if (this._single) return { data: result, error: null };
      return { data: toUpdate, error: null };
    }

    // ── DELETE ──
    if (this._op === 'delete') {
      const toDelete = this._applyFilters(table);
      const ids = new Set(toDelete.map(r => r.id));
      mockStore[this._table] = table.filter(r => !ids.has(r.id));
      return { data: toDelete, error: null };
    }

    return { data: null, error: { message: 'Operação desconhecida' } };
  }
}

// ─── Mock Supabase Client ─────────────────────────────────────────────────────
export const supabase = {
  from(table) {
    return new QueryBuilder(table);
  },

  rpc(fnName, params) {
    // Handles: create_ticket_comment(p_ticket_id, p_comment_text)
    if (fnName === 'create_ticket_comment') {
      const session = _loadSession();
      if (!session) return Promise.resolve({ data: null, error: { message: 'Não autenticado' } });
      const comment = {
        id:         genUUID(),
        ticket_id:  params.p_ticket_id,
        user_id:    session.user.id,
        comment:    params.p_comment_text,
        created_at: new Date().toISOString(),
      };
      mockStore.ticket_comments.push(comment);
      return Promise.resolve({ data: comment.id, error: null });
    }
    return Promise.resolve({ data: null, error: { message: `RPC "${fnName}" não implementada no mock` } });
  },

  auth: {
    getSession() {
      const session = _loadSession();
      return Promise.resolve({ data: { session }, error: null });
    },

    getUser(token) {
      // token may be passed explicitly (server-side pattern) or omitted
      const session = token
        ? { user: mockStore.users.find(u => u.id === token) }
        : _loadSession();
      const user = session?.user ?? null;
      return Promise.resolve({ data: { user }, error: user ? null : { message: 'Token inválido' } });
    },

    async signInWithPassword({ email, password }) {
      const user = mockStore.users.find(u => u.email === email && u.password === password);
      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'E-mail ou senha incorretos' } };
      }
      const session = _makeSession(user);
      _saveSession(session);
      setTimeout(() => _notify('SIGNED_IN', session), 0);
      return { data: { user: { id: user.id, email: user.email }, session }, error: null };
    },

    async signUp({ email, password }) {
      if (mockStore.users.find(u => u.email === email)) {
        return { data: { user: null }, error: { message: 'E-mail já cadastrado' } };
      }
      const user = { id: genUUID(), email, role: 'customer', password };
      mockStore.users.push(user);
      const session = _makeSession(user);
      _saveSession(session);
      setTimeout(() => _notify('SIGNED_IN', session), 0);
      return { data: { user: { id: user.id, email: user.email } }, error: null };
    },

    async signOut() {
      _saveSession(null);
      _notify('SIGNED_OUT', null);
      return { error: null };
    },

    onAuthStateChange(callback) {
      _listeners.push(callback);

      // Immediately fire if there is already a session
      const session = _loadSession();
      if (session) setTimeout(() => callback('SIGNED_IN', session), 0);

      return {
        data: {
          subscription: {
            unsubscribe() {
              _listeners = _listeners.filter(fn => fn !== callback);
            },
          },
        },
      };
    },
  },
};

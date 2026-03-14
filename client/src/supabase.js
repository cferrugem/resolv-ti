<<<<<<< HEAD
/**
 * supabase.js — Supabase client entry point.
 *
 * When REACT_APP_USE_MOCK=true (set in .env.local), exports the in-memory
 * mock client. Otherwise exports the real @supabase/supabase-js client.
 *
 * To re-enable the real database when it comes back online:
 *   1. Set REACT_APP_USE_MOCK=false (or delete the line) in client/.env.local
 *   2. Restart the dev server
 */

import { createClient } from '@supabase/supabase-js';
import { supabase as mockClient } from './supabaseMock.js';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

let supabaseClient;

if (USE_MOCK) {
  supabaseClient = mockClient;
  // eslint-disable-next-line no-console
  console.warn(
    '%c⚠️  MOCK MODE ATIVO — banco de dados real desativado.',
    'color: #f59e0b; font-weight: bold; font-size: 13px;'
  );
} else {
  const supabaseUrl     = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
=======
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração
console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'UNDEFINED');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'UNDEFINED');

// Adicionando verificações explícitas para garantir que as variáveis existam
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables.');
}
if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
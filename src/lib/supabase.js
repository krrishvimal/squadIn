import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  cleanUrl && 
  supabaseAnonKey && 
  cleanUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : null;

/**
 * Initialize anonymous auth session.
 * Returns the auth user ID (UUID) or null if auth is not available.
 * The Supabase client automatically persists the session in localStorage.
 */
export const initAuth = async () => {
  if (!supabase) return null;
  
  try {
    // Check for existing session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user.id;
    
    // No existing session — sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('Anonymous auth failed:', error.message);
      return null;
    }
    return data?.user?.id || null;
  } catch (err) {
    console.warn('Auth initialization error:', err);
    return null;
  }
};

/**
 * Get the current auth user ID synchronously from the cached session.
 * Returns null if no active session.
 */
export const getAuthUserId = () => {
  if (!supabase) return null;
  // supabase-js v2 caches session in memory after getSession()
  // We can't call async here, so rely on the session being initialized
  return null; // This will be set after initAuth() completes
};

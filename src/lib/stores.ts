import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

export const fetchUser = async () => {
  const { data } = await supabase.auth.getUser();
  supabase.auth.onAuthStateChange((event, session) => {
    user.set(session?.user ?? null);
  });
  user.set(data.user);
};

export const logout = async () => {
  await supabase.auth.signOut();
  
  user.set(null);
};
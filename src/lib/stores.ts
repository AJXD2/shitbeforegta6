import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { FlashMessage } from '$lib';

export const user = writable<User | null>(null);
export const flashMessages = writable<FlashMessage[]>([]);

export function addFlashMessage(
    options: FlashMessage
): void {
    const id = Date.now() + Math.random(); 

    flashMessages.update((messages) => [...messages, { id, ...options }]);

    
    setTimeout(() => {
        flashMessages.update((messages) =>
            messages.filter((msg) => msg.id !== id)
        );
    }, 6000);
}

export const fetchUser = async () => {
  const { data } = await supabase.auth.getUser();
  supabase.auth.onAuthStateChange((event, session) => {
    user.set(session?.user ?? null);
    if (event === 'SIGNED_OUT') {
      addFlashMessage({
        text: 'You have been signed out.',
        type: 'info',
        icon: 'mdi:information',

      });
    }
  });
  user.set(data.user);
};

export const logout = async () => {
  await supabase.auth.signOut();
  
  user.set(null);
};
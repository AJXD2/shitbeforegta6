import { writable, type Writable } from 'svelte/store';
import { getAllPosts, supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { FlashMessage, PostType } from '$lib';

export const user = writable<User | null>(null);
export const flashMessages = writable<FlashMessage[]>([]);

type RefreshableStore<T> = Writable<T> & {
  stop: () => void; 
};

type RefreshableStoreCallback<T> = {
  subscribe: RefreshableStore<T>['subscribe'];
  set: RefreshableStore<T>['set'];
  stop: RefreshableStore<T>['stop'];
};

function createRefreshableStore<T>(
  intervalMs: number,
  callback: (storeControls: RefreshableStoreCallback<T>) => void,
): RefreshableStore<T> {
  const { subscribe, set, update } = writable<T>(undefined as unknown as T); 

  const interval = setInterval(() => {
    callback({ subscribe, set, stop: () => clearInterval(interval) });
  }, intervalMs);

  return {
    subscribe,
    set,
    update,
    stop: () => clearInterval(interval),
  };
}


export const posts = createRefreshableStore(5000, async ({ set }) => {
  set(await getAllPosts());
});

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
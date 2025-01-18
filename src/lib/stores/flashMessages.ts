import type { FlashMessage } from '$lib';
import { writable } from 'svelte/store';

export const flashMessages = writable<FlashMessage[]>([]);

export function addFlashMessage(options: FlashMessage): void {
	const id = Date.now() + Math.random();

	flashMessages.update((messages) => [...messages, { id, ...options }]);

	setTimeout(() => {
		flashMessages.update((messages) => messages.filter((msg) => msg.id !== id));
	}, 6000);
}

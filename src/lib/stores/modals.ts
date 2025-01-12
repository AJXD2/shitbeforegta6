import { writable } from "svelte/store";

export const createPostModal = writable<boolean>(false);
export const loginModal = writable<boolean>(false);
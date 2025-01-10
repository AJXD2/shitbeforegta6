import { writable } from 'svelte/store';
import type { PostType } from '$lib';
import { getAll, get, create, update, remove } from '$lib/services/posts';
import { supabase } from '$lib/supabase';

export const posts = writable<PostType[]>([]);
export const currentPost = writable<PostType | null>(null);


export const fetchAllPosts = async () => {
    const { data: allPosts, error } = await supabase.from("posts").select("*");
    if (!error) {
        posts.set(allPosts || []);
    } else {
        console.error("Failed to fetch posts:", error.message);
    }
};

export const fetchPost = async (id: number) => {
    try {
        const post = await get(id);
        currentPost.set(post);
    } catch (error) {
        console.error("Failed to fetch post:", error);
    }
};



let refreshInterval: number | undefined;

export const startPostsAutoRefresh = (interval: number) => {
    stopPostsAutoRefresh(); 
    refreshInterval = window.setInterval(() => fetchAllPosts().catch(console.error), interval);
};

export const stopPostsAutoRefresh = () => {
    if (refreshInterval !== undefined) {
        clearInterval(refreshInterval);
        refreshInterval = undefined;
    }
};

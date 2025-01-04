import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import type { PostType } from "$lib";
import type Post from "./components/Post.svelte";
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getAllPosts = async (): Promise<PostType[]> => {
    const { data: postsData, error } = await supabase.from('posts').select('*');
		if (error) {
			console.error('Error fetching posts:', error.message);
		} else {
			return postsData;
		}
        return [];
    } 
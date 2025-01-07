import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public"
import type { PostType, PostVoteType, UserType } from "$lib";
import type Post from "./components/Post.svelte";
import { addFlashMessage } from "./stores";
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

export const getUserProfile = async (userId: string): Promise<UserType | null> => {
	const { data: userData, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
	if (error) {
		console.error('Error fetching user:', error.message);
	} else {
		if (!userData) {
			return null;
		}
		return userData as UserType;
	}
	return null;
}

export const getPostVotes = async (post: number): Promise<{votes: PostVoteType[], totalVotes: number, error:boolean}> => {
		const { data, error } = await supabase.from('post_votes').select('*').eq('post_id', post);
		if (error) {
			console.error('Error fetching post votes:', error);
			
		} else {
			let totalVotes = 0;
			for (const vote of data) {
				totalVotes =  (vote.vote_type === 'up' ? 1 : -1);
			}
			return { votes: data, totalVotes, error: false };
		}
		return {
			votes: [],
			totalVotes: 0,
			error: true
		};
	};
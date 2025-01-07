import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ params }) => {
	const {data: post} = await supabase.from('posts').select('*').eq('id', params.postId).single();

	if (post) {
		return post;
	}

	error(404, 'Not found');
};
import type { PostType, PostVoteType } from "$lib";
import { supabase } from "$lib/supabase";

const handleSupabaseError = (error: any, action: string) => {
    console.error(`Error ${action} post(s):`, error.message);
    return null;
};

export const getAll = async (): Promise<PostType[]> => {
    const { data: postsData, error } = await supabase.from('posts').select('*');
    return error ? handleSupabaseError(error, "fetching") || [] : postsData || [];
};

export const get = async (id: number): Promise<PostType | null> => {
    const { data: postData, error } = await supabase.from('posts').select('*').eq('id', id).single();
    return error ? handleSupabaseError(error, "fetching") : postData || null;
};

export const create = async (post: PostType): Promise<PostType | null> => {
    const { data: postData, error } = await supabase.from('posts').insert(post).single();
    return error ? handleSupabaseError(error, "creating") : postData;
};

export const update = async (post: PostType): Promise<PostType | null> => {
    const { data: postData, error } = await supabase.from('posts').update(post).eq('id', post.id).single();
    return error ? handleSupabaseError(error, "updating") : postData;
};

export const remove = async (id: number): Promise<boolean> => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
        handleSupabaseError(error, "deleting");
        return false;
    }
    return true;
};

export const getPostVotes = async (post_id: number): Promise<PostVoteType[]> => {
    const {data: voteData, error} = await supabase.from("post_votes").select("*").eq("post_id", post_id)
    if (error) {
        handleSupabaseError(error, "getting (Votes)")
    } else {
        return voteData
    }
    return []

}
export const updatePostVotes = async (post_id: number, user_id: number, vote: PostVoteType): Promise<PostVoteType | null> => {
    const {data: voteData, error} = await supabase.from('post_votes').update(vote).match({ post_id: post_id, user_id: user_id });
    if (error) {
        handleSupabaseError(error, "updating (Votes)")
    } else {
        return voteData
    }
    return null
}

export const removePostVote = async (post_id: number, user_id: string): Promise<boolean> => {
    const { error } = await supabase.from('post_votes').delete().match({ post_id: post_id, user_id: user_id });
    if (error) {
        handleSupabaseError(error, "deleting (Votes)")
        return false;
    }
    return true;
};

export const addPostVote = async (vote: PostVoteType): Promise<PostVoteType | null> => {
    vote.id = undefined;
    vote.created_at = undefined;
    const { data: voteData, error } = await supabase.from('post_votes').upsert(vote).single();
    if (error) {
        handleSupabaseError(error, "creating (Votes)")
    } else {
        return voteData
    }
    return null
}

export default { get, getAll, create, update, remove, votes: {
    getPostVotes,
    updatePostVotes,
    removePostVote,
    addPostVote
} };

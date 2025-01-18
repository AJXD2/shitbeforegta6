import type { PostCommentType } from '$lib';
import { supabase } from '$lib/supabase';

export const get = async (id: number): Promise<PostCommentType | null> => {
	const { data: postData, error } = await supabase
		.from('comments')
		.select('*')
		.eq('id', id)
		.single();
	if (error) {
		console.error('Error fetching post:', error.message);
	} else {
		if (!postData) {
			return null;
		}
		return postData as PostCommentType;
	}
	return null;
};
export const getPostComments = async (post_id: number): Promise<PostCommentType[] | null> => {
	const { data: postData, error } = await supabase
		.from('comments')
		.select('*')
		.eq('post_id', post_id);
	if (error) {
		console.error('Error fetching post:', error.message);
	} else {
		if (!postData) {
			return null;
		}
		return postData;
	}
	return null;
};
export const create = async (comment: PostCommentType): Promise<PostCommentType | null> => {
	const { data: commentData, error } = await supabase
		.from('comments')
		.insert(comment)
		.select()
		.single();

	if (error) {
		console.error('Error creating post:', error.message);
	} else {
		return commentData;
	}
	return null;
};
export const update = async (comment: PostCommentType): Promise<PostCommentType | null> => {
	const { data: postData, error } = await supabase
		.from('comments')
		.update(comment)
		.eq('id', comment.id)
		.single();
	if (error) {
		console.error('Error updating post:', error.message);
	} else {
		return postData as PostCommentType;
	}
	return null;
};
export const remove = async (id: number): Promise<boolean> => {
	const { error } = await supabase.from('comments').delete().eq('id', id);
	if (error) {
		console.error('Error deleting post:', error.message);
		return false;
	}
	return true;
};
const CommentService = {
	get,
	getPostComments,
	create,
	update,
	remove
};
export default CommentService;

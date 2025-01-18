import type { PostCommentType } from '$lib';
import CommentService from '$lib/services/comments';
import { get, writable } from 'svelte/store';

export type CommentContainer = {
	post_id: number;
	comments: PostCommentType[];
};

export const comments = writable<CommentContainer[]>([]);

export const getComments = async (post_id: number): Promise<CommentContainer | null> => {
	const data = await CommentService.getPostComments(post_id);
	if (data) {
		let curComments: CommentContainer = {
			post_id,
			comments: []
		};
		comments.update((currentComments) => {
			const index = currentComments.findIndex((c) => c.post_id === post_id);
			if (index === -1) {
				return [...currentComments, { post_id, comments: data }];
			} else {
				data.forEach((comment) => {
					currentComments[index].comments.push(comment);
				});
				curComments.comments = currentComments[index].comments;
				return currentComments;
			}
		});
		return curComments;
	}
	return null;
};

export const getComment = async (comment_id: number): Promise<PostCommentType | null> => {
	const data: PostCommentType | null = await CommentService.get(comment_id);

	if (data) {
		comments.update((currentComments) => {
			const index = currentComments.findIndex((c) => c.post_id === data.post_id);
			if (index === -1) {
				return [...currentComments, { post_id: data.post_id, comments: [data] }];
			} else {
				currentComments[index].comments.push(data);
				return currentComments;
			}
		});
		return data;
	}
	return null;
};

export const addComment = async (comment: PostCommentType): Promise<PostCommentType | null> => {
	const newComment = await CommentService.create(comment);
	if (newComment) {
		if (!newComment.id) {
			console.log('Comment created but no id returned');
			return null;
		}
		comments.update((currentComments) => {
			const index = currentComments.findIndex((c) => c.post_id === comment.post_id);
			if (index === -1) {
				return [...currentComments, { post_id: comment.post_id, comments: [...[newComment]] }];
			} else {
				currentComments[index].comments.push(newComment);
				return currentComments;
			}
		});
		return newComment;
	}
	return null;
};

export const removeComment = async (comment_id: number): Promise<boolean> => {
	const comment = await CommentService.remove(comment_id);
	if (comment) {
		comments.update((currentComments) => {
			return currentComments.map((c) => {
				c.comments = c.comments.filter((comment) => comment.id !== comment_id);
				return c;
			});
		});
		return true;
	}
	return false;
};

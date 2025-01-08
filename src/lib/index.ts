
export type BaseEntity = {
	created_at?: string;
};

export type PostType = BaseEntity & {
	id?: number;
	user_id: string;
	title: string;
	content: string;
	media_url?: string;
	media_type?: 'image' | 'youtube';
};

export type PostVoteType = BaseEntity & {
	id?: number;
	post_id: string;
	user_id: string;
	vote_type: 'up' | 'down';
};

export type UserType = {
	id: string;
	avatar_url: string;
	full_name: string;
	updated_at: string;
};

export type FlashMessage = {
	id?: number;
	text: string;
	type: 'success' | 'error' | 'info' | 'warning';
	icon?: string;
};

export type PostCommentType = BaseEntity & {
	id?: number;
	post_id: string;
	user_id: string;
	content: string;
};
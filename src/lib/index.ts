export type PostType = {
		id?: number;
		user_id: string;
		title: string;
		content: string;
		media_url?: string;
		media_type?: 'image' | 'youtube';
		created_at?: string;
	}

export type UserType = {
        id: string;
        avatar_url: string;
        full_name: string;
        updated_at: string;
}
import { supabase } from '$lib/supabase';
import type { UserType } from '$lib';

export const getAll = async (): Promise<UserType[]> => {
	const { data: userData, error } = await supabase.from('profiles').select('*');
	if (error) {
		console.error('Error fetching all users:', error.message);
	} else {
		return userData;
	}
	return [];
};

export const get = async (userId: string): Promise<UserType | null> => {
	const { data: userData, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();
	if (error) {
		console.error('Error fetching user:', error.message);
	} else {
		if (!userData) {
			return null;
		}
		return userData as UserType;
	}
	return null;
};

export const getByUsername = async (username: string): Promise<UserType | null> => {
	const { data: userData, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('full_name', username)
		.single();
	if (error) {
		console.error('Error fetching user:', error.message);
	} else {
		if (!userData) {
			return null;
		}
		return userData as UserType;
	}
	return null;
};

export const update = async (
	userId: string,
	profile: Partial<UserType>
): Promise<UserType | null> => {
	const { error } = await supabase.from('profiles').update(profile).eq('id', userId);
	if (error) {
		console.error('Error updating user:', error.message);
	} else {
		return await get(userId);
	}
	return null;
};

export const remove = async (userId: string): Promise<boolean> => {
	const { error } = await supabase.from('profiles').delete().eq('id', userId);
	if (error) {
		console.error('Error deleting user:', error.message);
		return false;
	}
	return true;
};

export default {
	get,
	getAll,
	getByUsername,
	update,
	remove
};

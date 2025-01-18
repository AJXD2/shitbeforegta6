import { fetchProfileByusername } from '$lib/stores/profiles';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const { username } = params;

	const profile = await fetchProfileByusername(username);
	return profile;
}) satisfies PageServerLoad;

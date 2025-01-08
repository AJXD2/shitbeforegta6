<script lang="ts">
	import type { PostCommentType, UserType } from '$lib';
	import { onMount } from 'svelte';
	import UserChip from './UserChip.svelte';
	import { getUserProfile } from '$lib/supabase';
	import { writable } from 'svelte/store';

	export let comment: PostCommentType;

	const author = writable<UserType | null>(null);

	onMount(async () => {
		author.set(await getUserProfile(comment.user_id));
	});
</script>

<div class="mt-8 w-full max-w-4xl">
	<div class="flex items-center space-x-4">
		<UserChip
			user={author}
			date={comment.created_at ? new Date(comment.created_at).toUTCString() : ''}
		/>
	</div>
	<p class="mt-2 text-secondary">
		{comment.content}
	</p>
</div>

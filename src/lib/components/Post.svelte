<script lang="ts">
	import type { PostType, UserType } from '$lib';
	import UserChip from '$lib/components/UserChip.svelte';

	export let post: PostType;
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { writable } from 'svelte/store';
	const user = writable<UserType | null>(null);

	onMount(async () => {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', post.user_id)
			.single();
		if (error) {
			console.error('Error fetching post user:', error);
		} else {
			user.set(data);
		}
	});
</script>

<article
	class="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-neutral"
>
	{#if post.media_type === 'image'}
		<img src={post.media_url} alt="Post" class="h-auto w-full rounded-t-lg" />
	{:else if post.media_type === 'youtube'}
		<iframe
			title="YouTube video player"
			src={`https://www.youtube.com/embed/${post.media_url}`}
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
			class="h-64 w-full rounded-t-lg"
		></iframe>
	{/if}
	<div class="card-body p-4">
		<div class="flex items-center">
			<h2 class="card-title text-xl font-bold text-secondary">
				{post.title}
				<UserChip username={$user?.full_name} pfp={$user?.avatar_url} />
			</h2>
		</div>
		<p class="mt-2 break-words text-secondary">{post.content}</p>
	</div>
</article>

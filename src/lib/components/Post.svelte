<script lang="ts">
	import type { PostType, UserType } from '$lib';

	export let post: PostType;
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';

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

	let userVote: 'up' | 'down' | null = null;

	// Handle voting logic
	const handleVote = (voteType: 'up' | 'down') => {
		if (voteType === userVote) {
			// Undo current vote
			post.votes += voteType === 'up' ? -1 : 1;
			userVote = null;
		} else {
			// Switch/add vote
			post.votes += voteType === 'up' ? (userVote === 'down' ? 2 : 1) : userVote === 'up' ? -2 : -1;
			userVote = voteType;
		}
	};
</script>

<article
	class="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-neutral"
>
	{#if post.media_url !== null}
		{#if post.media_type === 'image'}
			<img
				src={post.media_url}
				alt="Post"
				class="h-auto w-full rounded-t-lg object-cover transition-all duration-300 hover:scale-105"
			/>
		{:else if post.media_type === 'youtube'}
			<iframe
				title="YouTube video player"
				src={`https://www.youtube.com/embed/${post.media_url}`}
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				class="h-64 w-full rounded-t-lg transition-all duration-300 hover:scale-105"
			></iframe>
		{/if}
	{/if}

	<div class="card-body p-6">
		<UserChip {user} date={post.created_at || ''} />
		<h2 class="card-title text-xl font-bold text-secondary">{post.title}</h2>
		<p class="mt-2 break-words text-secondary">{post.content}</p>

		<div class="mt-6 flex w-full flex-row items-center justify-center gap-6 text-lg">
			<button
				class={`btn btn-sm rounded-full px-4 py-2 transition-all ${
					userVote === 'up' ? 'bg-green-700 text-white' : 'btn-primary'
				}`}
				on:click={() => handleVote('up')}
			>
				<Icon icon="mdi:thumb-up" /> Upvote
			</button>

			<span class="text-secondary">{post.votes}</span>

			<button
				class={`btn btn-sm rounded-full px-4 py-2 transition-all ${
					userVote === 'down' ? 'bg-red-700 text-white' : 'btn-primary'
				}`}
				on:click={() => handleVote('down')}
			>
				<Icon icon="mdi:thumb-down" /> Downvote
			</button>
		</div>
	</div>
</article>

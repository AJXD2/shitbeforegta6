<script lang="ts">
	import type { PostType, PostVoteType, UserType } from '$lib';
	import { onMount } from 'svelte';
	import { writable, get } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';
	import { addFlashMessage } from '$lib/stores/flashMessages';
	import { logout, user } from '$lib/stores/user';
	import { fetchProfile } from '$lib/stores/profiles';
	import PostService from '$lib/services/posts';

	export let post: PostType;

	const author = writable<UserType | null>(null);
	const votes = writable<PostVoteType[]>([]);
	const totalPostVotes = writable<number>(0);
	const userVote = writable<PostVoteType | null>(null);

	onMount(async () => {
		try {
			author.set(await fetchProfile(post.user_id));

			if (!post.id) return;

			const postVotes = await PostService.votes.getPostVotes(post.id);

			if (!postVotes) {
				throw new Error('Failed to fetch votes');
			}

			votes.set(postVotes);
			totalPostVotes.set(postVotes.length);

			const currentUser = get(user);
			const vote = postVotes.find((v) => v.user_id === currentUser?.id) || null;
			userVote.set(vote);
		} catch (error) {
			console.error(error);
			addFlashMessage({
				text: 'Failed to fetch votes (Check console)',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
		}
	});

	const handleVote = async (voteType: 'up' | 'down') => {
		const currentUser = get(user);

		if (!post.id || !currentUser) {
			addFlashMessage({
				text: 'Authentication error. Please log back in.',
				type: 'error',
				icon: 'material-symbols:warning'
			});
			await logout();
			return;
		}

		try {
			const currentVote = get(userVote);
			let newVoteType: PostVoteType | null = null;

			if (currentVote?.vote_type === voteType) {
				// Undo vote
				totalPostVotes.update((tpv) => tpv + (voteType === 'up' ? -1 : 1));
				await PostService.votes.removePostVote(post.id, currentUser.id);
				userVote.set(null);
			} else {
				// Update or add vote
				totalPostVotes.update((tpv) => {
					if (currentVote?.vote_type === 'up') return tpv - 2;
					if (currentVote?.vote_type === 'down') return tpv + 2;
					return tpv + (voteType === 'up' ? 1 : -1);
				});

				newVoteType = { user_id: currentUser.id, post_id: post.id, vote_type: voteType };
				userVote.set(newVoteType);
				await PostService.votes.addPostVote(newVoteType);
			}
		} catch (error) {
			console.error(error);
			addFlashMessage({
				text: 'Failed to vote (Check console)',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
		}
	};
</script>

<article
	class="card bg-base-100 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-neutral"
>
	{#if post.media_url}
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
		<UserChip user={author} date={post.created_at || ''} />

		<a href="/posts/{post.id}">
			<h2 class="card-title text-xl font-bold text-secondary">{post.title}</h2>
			<p class="mt-2 break-words text-secondary">{post.content}</p>
		</a>

		<div class="mt-6 flex w-full flex-row items-center justify-center gap-6 text-lg">
			<button
				class="btn btn-sm rounded-full px-4 py-2 transition-all {$userVote?.vote_type === 'up'
					? 'bg-green-700 text-white'
					: 'btn-primary'}"
				on:click={() => handleVote('up')}
			>
				<Icon icon="mdi:thumb-up" /> Upvote
			</button>

			<span class="text-secondary">{$totalPostVotes}</span>

			<button
				class="btn btn-sm rounded-full px-4 py-2 transition-all {$userVote?.vote_type === 'down'
					? 'bg-red-700 text-white'
					: 'btn-primary'}"
				on:click={() => handleVote('down')}
			>
				<Icon icon="mdi:thumb-down" /> Downvote
			</button>
		</div>
	</div>
</article>

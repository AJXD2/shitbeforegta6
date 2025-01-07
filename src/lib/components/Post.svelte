<script lang="ts">
	import type { PostType, PostVoteType, UserType } from '$lib';

	export let post: PostType;
	import { onMount } from 'svelte';
	import { getPostVotes, getUserProfile, supabase } from '$lib/supabase';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';
	import { addFlashMessage, user } from '$lib/stores';

	const author = writable<UserType | null>(null);
	const votes = writable<PostVoteType[]>([]);
	const totalPostVotes = writable<number>(0);

	onMount(async () => {
		author.set(await getUserProfile(post.user_id));
		if (!post.id) return;
		const { votes: postVotes, totalVotes, error } = await getPostVotes(post.id);
		if (error) {
			addFlashMessage({
				text: 'Failed to fetch votes (Check console)',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
		}
		votes.set(postVotes);
		totalPostVotes.set(totalVotes);
		for (const vote of postVotes) {
			if (vote.user_id === $user?.id) {
				userVote = vote.vote_type;
				break;
			}
		}
	});

	let userVote: 'up' | 'down' | null = null;

	// Handle voting logic
	const handleVote = async (voteType: 'up' | 'down') => {
		if (voteType === userVote) {
			// Undo current vote
			$totalPostVotes += voteType === 'up' ? -1 : 1;
			userVote = null;
		} else {
			// Switch/add vote
			$totalPostVotes +=
				voteType === 'up' ? (userVote === 'down' ? 2 : 1) : userVote === 'up' ? -2 : -1;
			userVote = voteType;
		}

		if (!$user) {
			addFlashMessage({
				text: 'You need to be logged in to vote',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}
		if (userVote === null) {
			const { error } = await supabase
				.from('post_votes')
				.delete()
				.match({ post_id: post.id, user_id: $user.id });
			if (error) {
				console.error('Error deleting vote:', error);
				addFlashMessage({
					text: 'Failed to delete vote (Check console)',
					type: 'error',
					icon: 'mdi:alert-circle-outline'
				});
			}
			return;
		}
		if (!post.id) return;
		const { votes: newVotes } = await getPostVotes(post.id);
		const previousVote = newVotes.find((vote) => vote.user_id === $user.id);
		if (previousVote) {
			const { error } = await supabase
				.from('post_votes')
				.update({ vote_type: userVote })
				.match({ post_id: post.id, user_id: $user.id });
			if (error) {
				console.error('Error updating vote:', error);
				addFlashMessage({
					text: 'Failed to update vote (Check console)',
					type: 'error',
					icon: 'mdi:alert-circle-outline'
				});
			}
			return;
		}

		const { error } = await supabase
			.from('post_votes')
			.upsert({ post_id: post.id, user_id: $user.id, vote_type: userVote });
		if (error) {
			console.error('Error voting:', error);
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
		<UserChip user={author} date={post.created_at || ''} />
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

			<span class="text-secondary">{$totalPostVotes}</span>

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

<script lang="ts">
	import type { PostCommentType, PostType, PostVoteType, UserType } from '$lib';

	export let post: PostType;
	import { onMount } from 'svelte';
	import { getPostVotes, getUserProfile, supabase } from '$lib/supabase';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';
	import { addFlashMessage, comments, user } from '$lib/stores';
	import Comment from './Comment.svelte';

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

	let comment: string;

	const handleComment = async () => {
		if (!$user) {
			addFlashMessage({
				text: 'You need to be logged in to comment',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}

		if (!comment) {
			return;
		}

		const { data, error } = await supabase.from('comments').insert({
			post_id: post.id,
			user_id: $user.id,
			content: comment
		});
		comments.forceRefresh();

		if (error) {
			console.error('Error commenting:', error);
			addFlashMessage({
				text: 'Failed to comment (Check console)',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}

		addFlashMessage({
			text: 'Comment posted successfully',
			type: 'success',
			icon: 'mdi:check-circle-outline'
		});
	};
</script>

<div class="flex flex-col items-center bg-base-100 px-4 py-8 text-base-content md:px-12 lg:px-24">
	<!-- Header -->
	<section class="w-full max-w-5xl">
		<header class="text-center">
			<h1 class="mb-4 text-4xl font-bold text-primary md:text-5xl">{post.title}</h1>
			<div class="flex items-center justify-center space-x-4 text-secondary">
				<UserChip user={author} />
			</div>
		</header>
	</section>

	<!-- Media -->
	{#if post.media_url}
		<section class="my-6 w-full max-w-4xl">
			{#if post.media_type === 'image'}
				<img
					src={post.media_url}
					alt="Post Media"
					class="w-full rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
				/>
			{:else if post.media_type === 'youtube'}
				<iframe
					title="YouTube video player"
					src={`https://www.youtube.com/embed/${post.media_url}`}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					class="h-64 w-full rounded-lg shadow-md md:h-96"
				></iframe>
			{/if}
		</section>
	{/if}

	<!-- Content -->
	<section class="w-full max-w-4xl">
		<p class="text-lg leading-relaxed text-secondary md:text-xl">{post.content}</p>
	</section>

	<!-- Vote Section -->
	<section class="mt-8 flex w-full max-w-4xl flex-col items-center">
		<div class="flex items-center space-x-8">
			<button
				class={`btn btn-circle text-xl ${userVote === 'up' ? 'btn-success' : 'btn-secondary'}`}
				on:click={() => handleVote('up')}
			>
				<Icon icon="mdi:thumb-up" class="h-6 w-6" />
			</button>
			<span class="text-2xl font-bold text-secondary">Votes: {$totalPostVotes}</span>
			<button
				class={`btn btn-circle text-xl ${userVote === 'down' ? 'btn-error' : 'btn-secondary'}`}
				on:click={() => handleVote('down')}
			>
				<Icon icon="mdi:thumb-down" class="h-6 w-6" />
			</button>
		</div>
	</section>
	<!-- Comments Section -->
	<section class="mt-8 flex w-full max-w-4xl flex-col items-center">
		<div class="alert alert-warning flex items-center space-x-4 shadow-lg">
			<div class="flex items-center space-x-4">
				<Icon icon="mdi:alert-circle-outline" class="h-6 w-6" />
				<span>Comment section isn't implemented yet.</span>
			</div>
		</div>
	</section>
	<section class="mt-8 flex w-full max-w-4xl flex-col items-center">
		<h2 class="text-2xl font-bold text-primary">Comments</h2>
		<div class="w-full max-w-4xl">
			<textarea
				class="mt-4 w-full rounded-lg bg-base-200 p-4 text-lg text-secondary shadow-md"
				placeholder="Write a comment..."
				bind:value={comment}
				on:submit={handleComment}
			></textarea>
			<button class="btn btn-primary mt-4" on:click={handleComment}>Post Comment</button>
		</div>
		<div class="mt-8 w-full max-w-4xl">
			{#each $comments as comment (comment.id)}
				<Comment {comment} />
			{/each}
		</div>
	</section>
</div>

<script lang="ts">
	import type { PostCommentType, PostType, PostVoteType, UserType } from '$lib';

	export let post: PostType;
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { get, writable } from 'svelte/store';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';
	import PostService from '$lib/services/posts';
	import CommentService from '$lib/services/comments';
	import Comment from './Comment.svelte';
	import { addFlashMessage } from '$lib/stores/flashMessages';
	import { logout, user } from '$lib/stores/user';

	import { fetchProfile } from '$lib/stores/profiles';
	import { addComment, comments, getComments } from '$lib/stores/comments';
	const author = writable<UserType | null>(null);
	const votes = writable<PostVoteType[]>([]);
	const totalPostVotes = writable<number>(0);
	const userVote = writable<PostVoteType | null>(null);
	const postComments = writable<PostCommentType[]>([]);

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
			comments.subscribe((containers) => {
				const container = containers.find((comment) => comment.post_id === post.id);
				postComments.set(container?.comments || []);
			});
			const fetchedComments = await getComments(post.id);
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
		if (!post.id) return;
		if (!comment) {
			return;
		}

		const newComment = await addComment({
			content: comment,
			post_id: post.id,
			user_id: $user.id
		});
		if (!newComment) {
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
		comment = '';
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
				class={`btn btn-circle text-xl ${($userVote?.vote_type || 'down') === 'up' ? 'btn-success' : 'btn-secondary'}`}
				on:click={() => handleVote('up')}
			>
				<Icon icon="mdi:thumb-up" class="h-6 w-6" />
			</button>
			<span class="text-2xl font-bold text-secondary">Votes: {$totalPostVotes}</span>
			<button
				class={`btn btn-circle text-xl ${($userVote?.vote_type || 'up') === 'down' ? 'btn-error' : 'btn-secondary'}`}
				on:click={() => handleVote('down')}
			>
				<Icon icon="mdi:thumb-down" class="h-6 w-6" />
			</button>
		</div>
	</section>
	<!-- Comments Section -->

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
			{#each $postComments as comment (comment.id)}
				<Comment {comment} />
			{/each}
		</div>
	</section>
</div>

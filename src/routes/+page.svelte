<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { PostType } from '$lib';
	import Post from '$lib/components/Post.svelte';
	import CreatePost from '$lib/components/CreatePost.svelte';
	import Icon from '@iconify/svelte';
	import { fetchAllPosts, posts } from '$lib/stores/posts';
	import { addFlashMessage, flashMessages } from '$lib/stores/flashMessages';
	import { user } from '$lib/stores/user';

	let showModal = false;
	let searchQuery = '';

	async function handleSearch() {
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			await fetchAllPosts();
		} else {
			posts.update((currentPosts) =>
				currentPosts.filter(
					(post) =>
						post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
				)
			);
		}
	}

	function closeModal() {
		showModal = false;
	}

	function handleCreatePost() {
		if ($user === null) {
			flashMessages.update((messages) => [
				...messages,
				{ id: Date.now(), text: 'You must be logged in to create a post.', type: 'error' }
			]);
		} else {
			showModal = true;
		}
	}
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
			<CreatePost
				onCreatePost={(post) => {
					posts.update((existingPosts) => [post, ...existingPosts]);
					closeModal();
				}}
			/>
			<div class="modal-action">
				<button class="btn btn-primary" on:click={closeModal}>Close</button>
			</div>
		</div>
	</div>
{/if}

<main class="container mx-auto min-h-screen bg-base-200 px-6 py-8">
	<div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
		<div class="form-control w-full sm:max-w-xs">
			<div class="input-group">
				<input
					type="text"
					placeholder="Search posts..."
					class="input input-bordered w-full"
					bind:value={searchQuery}
					on:input={handleSearch}
				/>
			</div>
		</div>
		<button class="btn btn-primary flex items-center gap-2 sm:w-auto" on:click={handleCreatePost}>
			<Icon icon="material-symbols:add" class="h-5 w-5" />
			Create Post
		</button>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each $posts as post (post.id)}
			<Post {post} />
		{/each}
	</div>
</main>

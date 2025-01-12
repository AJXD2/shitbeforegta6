<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import type { PostType } from '$lib';
	import Post from '$lib/components/Post.svelte';
	import CreatePost from '$lib/components/CreatePost.svelte';
	import Icon from '@iconify/svelte';
	import { fetchAllPosts, posts, searchPosts } from '$lib/stores/posts';
	import { addFlashMessage, flashMessages } from '$lib/stores/flashMessages';
	import { user } from '$lib/stores/user';
	import { pageTitle } from '$lib/stores/title';
	import { createPostModal } from '$lib/stores/modals';
	pageTitle.set('Home');
	let showModal = false;
	let searchQuery = '';

	const filteredPosts = writable<PostType[]>([]);

	onMount(async () => {
		await fetchAllPosts();
		filteredPosts.set(get(posts));
	});
	let searchTimeout: NodeJS.Timeout;
	async function handleSearch() {
		const query = searchQuery.trim().toLowerCase();

		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			if (!query) {
				filteredPosts.set(get(posts));
				return;
			}

			console.log(query);

			try {
				const results = await searchPosts(query);
				filteredPosts.set(results);
			} catch (error) {
				console.error('Error searching posts:', error);
			}
		}, 500);
	}
</script>

<main class="container mx-auto min-h-screen bg-base-200 px-6 py-8">
	<div class="flex w-full flex-row items-center justify-between gap-6">
		<div class="form-control w-full">
			<div class="input-group w-full">
				<input
					type="text"
					placeholder="Search posts..."
					class="input input-bordered w-full"
					bind:value={searchQuery}
					on:input={handleSearch}
				/>
			</div>
		</div>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each $filteredPosts as post (post.id)}
			<Post {post} />
		{/each}
	</div>
</main>

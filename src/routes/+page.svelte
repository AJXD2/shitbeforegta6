<script lang="ts">
	import { supabase, getAllPosts } from '$lib/supabase';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { PostType } from '$lib';
	import Post from '$lib/components/Post.svelte';
	import CreatePost from '$lib/components/CreatePost.svelte';
	const posts = writable<PostType[]>([]);

	onMount(async () => {
		posts.set(await getAllPosts());
	});
	let showModal = false;

	let searchQuery = '';

	async function handleSearch() {
		const search = searchQuery.toLowerCase();
		if (search === '') {
			posts.set(await getAllPosts());
		} else {
			posts.update((posts) => {
				return posts.filter((post) => {
					return (
						post.title.toLowerCase().includes(search) || post.content.toLowerCase().includes(search)
					);
				});
			});
		}
	}
</script>

{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<CreatePost
				onCreatePost={(post) => {
					posts.update((posts) => [post, ...posts]);
					showModal = false;
				}}
			/>
			<div class="modal-action">
				<button class="btn" on:click={() => (showModal = false)}>Close</button>
			</div>
		</div>
	</div>
{/if}

<main class="container mx-auto my-8">
	<div class="flex items-center justify-between">
		<div class="form-control w-full max-w-xs">
			<div class="input-group">
				<input
					type="text"
					placeholder="Search…"
					class="input input-bordered w-full"
					bind:value={searchQuery}
					on:input={handleSearch}
				/>
			</div>
		</div>
		<button class="btn btn-primary" on:click={() => (showModal = true)}>Create Submission</button>
	</div>
	<div class="grid grid-cols-1 gap-4 pt-16 md:grid-cols-2 lg:grid-cols-3">
		{#each $posts as post}
			<Post {post} />
		{/each}
	</div>
</main>

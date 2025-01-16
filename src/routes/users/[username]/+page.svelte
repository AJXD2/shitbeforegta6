<script lang="ts">
	import type { UserType } from '$lib';
	import Post from '$lib/components/Post.svelte';
	import ProfileEditForm from '$lib/components/ProfileEditForm.svelte';
	import { profileEditModal } from '$lib/stores/modals';
	import { pageTitle } from '$lib/stores/title';
	import { user } from '$lib/stores/user';
	import { writable } from 'svelte/store';
	export let data: UserType;
	import type { PostType } from '$lib';
	import { onMount } from 'svelte';
	import PostService from '$lib/services/posts';
	import Icon from '@iconify/svelte';
	pageTitle.set(`@${data.full_name}`);
	const userPosts = writable<PostType[]>([]);
	const featuredPost = writable<PostType | null>(null);
	onMount(async () => {
		PostService.getUserPosts(data.id).then((posts) => {
			posts.sort(
				(a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
			);
			const featured = posts.find((post) => post.id === data.featured_post);
			if (featured) {
				posts = [featured, ...posts.filter((post) => post.id !== data.featured_post)];
			}
			userPosts.set(posts);

			featuredPost.set(posts.find((post) => post.id === data.featured_post) || null);
		});
	});
	async function handleEdit() {
		profileEditModal.set(true);
	}
</script>

<div class="flex min-h-screen flex-col items-center bg-base-200">
	<div
		class="container mx-auto flex flex-col items-center justify-center md:flex-row md:items-start md:space-x-8"
	>
		<!-- User Profile -->
		<div class="card mt-6 w-80 bg-base-100 shadow-xl md:w-1/3">
			<figure class="px-10 pt-10">
				<img
					src={data.avatar_url}
					alt="User avatar"
					class="h-24 w-24 rounded-full border-2 border-primary"
				/>
			</figure>
			<div class="card-body items-center text-center">
				<h2 class="card-title">{data.full_name}</h2>
				<p class="text-sm text-gray-500">
					Last updated: {new Date(data?.updated_at || '').toLocaleDateString('en-US', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</p>

				<p class="mt-2 text-sm text-gray-500">
					{data.bio || 'No bio available.'}
				</p>
				{#if $user?.id === data.id}
					<div class="card-actions mt-4">
						<button class="btn btn-primary" onclick={handleEdit}>Edit Profile</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- User Posts -->
	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each $userPosts as post}
			<div class="mb-6 break-inside-avoid">
				{#if post.id === $featuredPost?.id}
					<div
						class="featured-post relative mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 p-4 shadow-lg"
					>
						<!-- Featured Badge -->
						<div
							class="absolute right-2 top-2 z-50 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black shadow-md"
						>
							<Icon icon="material-symbols:star" class="h-4 w-4" />
							FEATURED
						</div>
						<Post {post} />
					</div>
				{:else}
					<div class="regular-post mb-4">
						<Post {post} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

{#if $profileEditModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
			<div class="modal-body">
				<ProfileEditForm user={data} />
			</div>
			<div class="modal-action">
				<button
					class="btn btn-primary"
					onclick={() => {
						profileEditModal.set(false);
					}}>Close</button
				>
			</div>
		</div>
	</div>
{/if}

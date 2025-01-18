<script lang="ts">
	// Imports
	import '../app.css';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { fetchUser, logout, user } from '$lib/stores/user';
	import { flashMessages } from '$lib/stores/flashMessages';
	import { fetchAllPosts, posts, startPostsAutoRefresh } from '$lib/stores/posts';
	import { fetchAllProfiles, startProfilesAutoRefresh, userProfile } from '$lib/stores/profiles';
	import { writable } from 'svelte/store';
	import { pageTitle } from '$lib/stores/title';
	import CreatePost from '$lib/components/CreatePost.svelte';
	import { createPostModal } from '$lib/stores/modals';
	import { goto } from '$app/navigation';

	let { children } = $props();
	pageTitle.set('ShitBeforeGTA6');

	let showLoginModal = writable<boolean>(false);

	onMount(() => {
		fetchUser();
		fetchAllPosts();
		fetchAllProfiles();
		startPostsAutoRefresh(60000);
		startProfilesAutoRefresh(60000);
	});

	async function signInWithDiscord() {
		try {
			await supabase.auth.signInWithOAuth({ provider: 'discord' });
		} catch (error) {
			console.error('Error signing in:', error);
		}
	}

	async function signOut() {
		try {
			logout();
		} catch (error) {
			console.error('Error signing out:', error);
		}
	}

	function toggleLoginModal() {
		$showLoginModal = !$showLoginModal;
	}

	flashMessages.subscribe((messages) => {
		if (messages.length > 3) {
			messages.shift();
		}
	});
	function handleCreatePost() {
		if ($user === null) {
			flashMessages.update((messages) => [
				...messages,
				{ id: Date.now(), text: 'You must be logged in to create a post.', type: 'error' }
			]);
		} else {
			createPostModal.set(true);
		}
	}
</script>

<title>{$pageTitle}</title>

<!-- Persistent Warning Banner -->
<div
	class="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning py-2 text-warning-content shadow-md"
>
	<Icon icon="material-symbols:warning" class="h-5 w-5" />
	<span>This site is under development. Expect bugs!</span>
</div>

<!-- Navbar -->
<nav class="navbar mt-12 bg-base-100 shadow-lg">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl font-bold normal-case text-primary">ShitBeforeGTA6</a>
	</div>
	<div class="flex-none">
		{#if $user !== null}
			<button type="button" class="btn btn-primary btn-sm mr-4" onclick={handleCreatePost}>
				<span class="hidden sm:inline">Create Post</span>
				<Icon icon="material-symbols:add" class="h-5 w-5" />
			</button>
			<div class="dropdown dropdown-end">
				<label tabindex="-1" for="avatar" class="avatar btn btn-circle btn-ghost">
					<div class="w-10 rounded-full" id="avatar">
						<img src={$userProfile?.avatar_url || ''} alt="User Avatar" />
					</div>
				</label>

				<ul
					tabindex="-1"
					class="menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<button
							class="text-left"
							onclick={() => {
								goto(`/users/${$userProfile?.full_name}`);
							}}
						>
							<Icon icon="mdi:account-circle" class="h-5 w-5" /> Profile
						</button>

						<button type="button" class="text-left text-red-600" onclick={signOut}
							><Icon icon="mdi:logout" class="h-5 w-5" />Logout</button
						>
					</li>
				</ul>
			</div>
		{:else}
			<button
				type="button"
				class="avatar btn btn-circle btn-ghost"
				onclick={toggleLoginModal}
				onkeydown={(e) => e.key === 'Enter' && toggleLoginModal()}
			>
				<Icon icon="mdi:account-circle" class="h-10 w-10" />
			</button>
		{/if}
	</div>
</nav>

<!-- Main Content -->
<main class="container mx-auto min-h-screen bg-base-200 px-6 py-8">
	{@render children()}
</main>

<!-- Footer -->
<footer
	class="footer rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-lg"
>
	<div
		class="container mx-auto flex flex-col items-center justify-between space-y-4 lg:flex-row lg:space-y-0"
	>
		<div class="flex flex-col items-center space-y-2 lg:items-start">
			<p class="text-lg font-semibold">Copyright © 2025 - All rights reserved by ShitBeforeGTA6</p>
			<p class="text-sm text-opacity-80">
				Made with ❤️ by
				<a
					href="https://ajxd2.dev"
					class="link-hover link link-accent"
					target="_blank"
					rel="noopener">AJXD2</a
				>
			</p>
			<div class="flex space-x-6">
				<a href="/tos" class="link-hover link link-accent">Terms of Service</a>
				<a href="/privacy" class="link-hover link link-accent">Privacy Policy</a>
			</div>
		</div>
		<div class="flex space-x-6 text-lg">
			<a
				href="https://github.com/ajxd2/shitbeforegta6"
				class="tooltip tooltip-bottom"
				data-tip="Source Code"
				target="_blank"
				rel="noopener"
			>
				<Icon icon="mdi:github" class="h-8 w-8 transition-colors hover:text-gray-100" />
			</a>
			<a
				href="https://x.com/AJXD_2"
				class="tooltip tooltip-bottom"
				data-tip="My Twitter"
				target="_blank"
				rel="noopener"
			>
				<Icon icon="mdi:twitter" class="h-8 w-8 transition-colors hover:text-gray-100" />
			</a>
			<a
				href="https://ajxd2.dev"
				class="tooltip tooltip-bottom"
				data-tip="My Website"
				target="_blank"
				rel="noopener"
			>
				<Icon icon="mdi:web" class="h-8 w-8 transition-colors hover:text-gray-100" />
			</a>
		</div>
	</div>
</footer>

<!-- Login Modal -->
{#if $showLoginModal}
	<div class="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-md">
		<div class="w-full max-w-md rounded-lg bg-base-100 p-8 shadow-xl">
			<h2 class="mb-4 text-xl font-semibold">Terms of Service & Privacy Policy</h2>
			<p class="mb-4">
				By continuing, you agree to our
				<a href="/tos" class="link link-primary" target="_blank" rel="noopener">Terms of Service</a>
				and
				<a href="/privacy" class="link link-primary" target="_blank" rel="noopener"
					>Privacy Policy</a
				>.
			</p>
			<div class="flex justify-between gap-4">
				<button onclick={toggleLoginModal} class="btn btn-outline">Cancel</button>
				<button class="btn btn-primary" onclick={signInWithDiscord}>Login with Discord</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Post Modal -->
{#if $createPostModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
			<CreatePost
				onCreatePost={(post) => {
					posts.update((existingPosts) => [post, ...existingPosts]);
					createPostModal.set(false);
				}}
			/>
			<div class="modal-action">
				<button
					class="btn btn-primary"
					onclick={() => {
						createPostModal.set(false);
					}}>Close</button
				>
			</div>
		</div>
	</div>
{/if}
<!-- Toast Notifications -->
<div class="toast toast-end toast-bottom z-50 space-y-4">
	{#each $flashMessages as { id, text, type, icon } (id)}
		<div class={`alert alert-${type} flex items-center gap-2 shadow-lg`}>
			{#if icon}
				<Icon {icon} class="h-6 w-6 text-base-content" />
			{/if}
			<span class="text-base-content">{text}</span>
		</div>
	{/each}
</div>

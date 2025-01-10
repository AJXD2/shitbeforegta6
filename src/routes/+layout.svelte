<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	import Icon from '@iconify/svelte';
	import { fetchUser, logout, user } from '$lib/stores/user';
	import { flashMessages } from '$lib/stores/flashMessages';
	import { fetchAllPosts, startPostsAutoRefresh } from '$lib/stores/posts';
	import { fetchAllProfiles, startProfilesAutoRefresh } from '$lib/stores/profiles';

	onMount(() => {
		fetchUser();
		fetchAllPosts();
		fetchAllProfiles();
		startPostsAutoRefresh(15000);
		startProfilesAutoRefresh(15000);
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

	flashMessages.subscribe((messages) => {
		if (messages.length > 3) {
			messages.shift();
		}
	});
</script>

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
		<a href="/" class="btn btn-ghost text-xl font-bold normal-case text-primary">
			ShitBeforeGTA6
		</a>
	</div>
	<div class="flex-none">
		<!-- Legal Links-->
		<a href="/tos" class="btn btn-ghost">Terms of Service</a>
		<a href="/privacy" class="btn btn-ghost">Privacy Policy</a>
		{#if $user}
			<div class="dropdown dropdown-end">
				<label tabindex="-1" for="avatar" class="avatar btn btn-circle btn-ghost">
					<div class="w-10 rounded-full" id="avatar">
						<img src={$user.user_metadata?.avatar_url || '/default-avatar.png'} alt="User Avatar" />
					</div>
				</label>
				<ul
					tabindex="-1"
					class="menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<button type="button" class="text-left" onclick={signOut}>Logout</button>
						<button type="button" class="text-left" onclick={signInWithDiscord}
							>Reauthenticate</button
						>
					</li>
				</ul>
			</div>
		{:else}
			<button class="btn btn-primary" type="button" onclick={signInWithDiscord}>
				Sign in with Discord
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
					rel="noopener"
				>
					AJXD2
				</a>
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

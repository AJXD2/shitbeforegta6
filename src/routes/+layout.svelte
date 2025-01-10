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

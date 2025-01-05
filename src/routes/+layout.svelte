<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	import { fetchUser, logout, user } from '$lib/stores';

	onMount(() => {
		fetchUser();
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
</script>

<nav class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl normal-case">ShitBeforeGTA6</a>
	</div>
	<div class="alert alert-warning shadow-lg">
		<div>
			<span>This site is under development. Expect bugs!</span>
		</div>
	</div>
	<div class="flex-none">
		{#if $user}
			<div class="dropdown dropdown-end">
				<label for="user-avatar" tabindex="-1" class="avatar btn btn-circle btn-ghost">
					<div class="w-10 rounded-full">
						<img
							id="user-avatar"
							src={$user.user_metadata?.avatar_url || '/default-avatar.png'}
							alt="User Avatar"
						/>
					</div>
				</label>
				<ul
					tabindex="-1"
					class="menu-compact menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<button type="button" onclick={signOut}>Logout</button>
					</li>
				</ul>
			</div>
		{:else}
			<button class="btn btn-primary" type="button" onclick={signInWithDiscord}
				>Sign in with Discord</button
			>
		{/if}
	</div>
</nav>

<main>
	{@render children()}
</main>

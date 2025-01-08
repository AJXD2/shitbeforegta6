<script lang="ts">
	import type { PostType, UserType } from '$lib';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import UserChip from '$lib/components/UserChip.svelte';
	import { writable } from 'svelte/store';
	import Post from '$lib/components/Post.svelte';
	import PagePost from '$lib/components/PagePost.svelte';

	export let data: PostType;

	let author = writable<UserType | null>(null);

	onMount(async () => {
		if ('user_id' in data) {
			const { data: userData, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user_id)
				.single();
			if (error) {
				console.error('Error fetching user:', error.message);
			} else {
				author.set(userData);
			}
		}
	});
</script>

{#if data}
	<div class="container mx-auto p-4 md:p-8">
		<PagePost post={data} />
	</div>
{:else}
	<div class="flex h-screen items-center justify-center">
		<div
			class="h-9 w-9 animate-spin rounded-full border-4 border-solid border-gray-200 border-l-blue-500"
		>
			<img src="/loading.svg" alt="" />
		</div>
	</div>
{/if}

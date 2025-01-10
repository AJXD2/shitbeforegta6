<script lang="ts">
	import type { PostCommentType, UserType } from '$lib';
	import { onMount } from 'svelte';
	import UserChip from './UserChip.svelte';
	import { writable } from 'svelte/store';
	import { profiles } from '$lib/stores/profiles';
	import { addFlashMessage } from '$lib/stores/flashMessages';
	import { user } from '$lib/stores/user';
	import { removeComment } from '$lib/stores/comments';

	export let comment: PostCommentType;

	const author = writable<UserType | null>(null);

	onMount(async () => {
		let profs: UserType | undefined;
		profiles.subscribe((data) => {
			profs = data.find((v) => v.id === comment.user_id);
		});
		if (!profs) {
			addFlashMessage({
				text: 'An error occurred',
				type: 'error'
			});
		}
		author.set(profs ?? null);
	});

	const handleDelete = async () => {
		if (!comment.id) return;
		await removeComment(comment.id);
		addFlashMessage({
			text: 'Comment deleted',
			type: 'success',
			icon: 'material-symbols:check-circle-outline'
		});
	};
</script>

<div class="mt-8 w-full max-w-4xl">
	<div class="flex items-center space-x-4">
		<UserChip
			user={author}
			date={comment.created_at ? new Date(comment.created_at).toUTCString() : ''}
		/>
	</div>
	<p class="mt-2 text-secondary">
		{comment.content}
	</p>
	{#if $user?.id === $author?.id}
		<div class="mt-4 flex space-x-4">
			<button class="text-red-500 hover:underline" on:click={handleDelete}> Delete </button>
		</div>
	{:else}
		<div class="mt-4 flex space-x-4">
			<button
				class="text-blue-500 hover:underline"
				on:click={() =>
					addFlashMessage({
						text: 'Not implemented',
						type: 'info',
						icon: 'material-symbols:info-outline'
					})}
			>
				Report
			</button>
		</div>
	{/if}
</div>

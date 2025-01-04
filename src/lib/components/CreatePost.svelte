<script lang="ts">
	import type { PostType, UserType } from '$lib';
	import { supabase } from '$lib/supabase';
	export let onCreatePost: (post: PostType) => void;

	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	let title = '';
	let content = '';
	let media_url = '';
	let media_type: 'image' | 'youtube' | undefined = undefined;

	let user = writable<UserType | null>(null);

	onMount(() => {
		supabase.auth.getUser().then((user) => {
			user = user;
		});
	});

	const handleSubmit = async () => {
		if (!title || !content) {
			return;
		}

		if (media_url) {
			if (media_url.includes('youtube.com') || media_url.includes('youtu.be')) {
				media_type = 'youtube';
			} else {
				media_type = 'image';
			}
		}

		const { data: userData } = await supabase.auth.getUser();
		if (!userData || !userData.user?.id) {
			return;
		}

		const newPost: PostType = {
			user_id: userData.user?.id,
			title,
			content,
			media_url,
			media_type
		};

		const { error } = await supabase.from('posts').insert(newPost);
		if (error) {
			alert('Error creating post: ' + error.message);
			return;
		}

		onCreatePost(newPost);
		title = '';
		content = '';
		media_url = '';
		media_type = undefined;
	};
</script>

<div class="mx-auto max-w-xl rounded-lg p-4 shadow-lg">
	<h2 class="mb-4 text-2xl font-semibold">Create a New Post</h2>

	<div class="space-y-4">
		<!-- Title Input -->
		<div class="form-control">
			<label class="label" for="title">
				<span class="label-text">Title</span>
			</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				class="input input-bordered w-full"
				placeholder="Enter the title of your post"
			/>
		</div>

		<!-- Content Input -->
		<div class="form-control">
			<label class="label" for="content">
				<span class="label-text">Content</span>
			</label>
			<textarea
				id="content"
				bind:value={content}
				class="textarea textarea-bordered w-full"
				placeholder="Write the content of your post here"
			></textarea>
		</div>

		<!-- Media URL Input -->
		<div class="form-control">
			<label class="label" for="media_url">
				<span class="label-text">Media URL (Optional)</span>
			</label>
			<input
				type="text"
				id="media_url"
				bind:value={media_url}
				class="input input-bordered w-full"
				placeholder="Enter image or YouTube URL"
			/>
			{#if media_url}
				<div class="mt-2 flex items-center space-x-2">
					<label class="label" for="media_type">
						<span class="label-text">Media Type</span>
					</label>
					<select id="media_type" bind:value={media_type} class="select select-bordered w-full">
						<option value="image">Image</option>
						<option value="youtube">YouTube</option>
					</select>
				</div>
			{/if}
		</div>

		<button class="btn btn-info w-full" on:click={handleSubmit}> Create Post </button>
	</div>
</div>

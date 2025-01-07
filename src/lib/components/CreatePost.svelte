<script lang="ts">
	import type { PostType } from '$lib';
	import { addFlashMessage, user } from '$lib/stores';
	import { supabase } from '$lib/supabase';

	export let onCreatePost: (post: PostType) => void;

	let title = '';
	let content = '';
	let media_url = '';
	let media_type: 'image' | 'youtube' | undefined = undefined;
	let file: File | null = null;

	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		file = target.files ? target.files[0] : null;
	};

	const uploadImage = async () => {
		if (!file) return null;

		const fileName = `${Date.now()}-${file.name}`;
		const { data, error } = await supabase.storage.from(`uploads`).upload(fileName, file);

		if (error) {
			console.error('Error uploading image:', error.message);
			addFlashMessage({
				text: 'Failed to upload image (Check console)',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return null;
		}

		return supabase.storage.from('uploads').getPublicUrl(data.path).data.publicUrl;
	};

	const handleSubmit = async () => {
		if (!title || !content) {
			addFlashMessage({
				text: 'Title and content are required',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}

		if (file) {
			media_url = (await uploadImage()) || '';
			if (!media_url) {
				addFlashMessage({
					text: 'Failed to create post. (File)',
					type: 'error',
					icon: 'mdi:alert-circle-outline'
				});
				return;
			}
			media_type = 'image';
		} else if (media_url) {
			if (media_url.includes('youtube.com') || media_url.includes('youtu.be')) {
				media_type = 'youtube';
				let youtubeId = media_url.split('v=')[1];
				const queryPosition = youtubeId?.indexOf('?');
				if (queryPosition !== -1) {
					youtubeId = youtubeId.substring(0, queryPosition);
				}
				media_url = youtubeId;
			} else {
				media_type = 'image';
			}
		}

		const { data: userData } = await supabase.auth.getUser();
		if (!userData || !userData.user?.id) {
			addFlashMessage({
				text: 'You must be logged in to create a post',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}

		const newPost: PostType = {
			user_id: userData.user.id,
			title,
			content,
			media_url,
			media_type
		};

		const { error } = await supabase.from('posts').insert(newPost);
		if (error) {
			addFlashMessage({
				text: 'Failed to create post',
				type: 'error',
				icon: 'mdi:alert-circle-outline'
			});
			return;
		}

		onCreatePost(newPost);
		title = '';
		content = '';
		media_url = '';
		media_type = undefined;
		file = null;
	};
</script>

<div class="mx-auto max-w-2xl rounded-lg bg-base-200 p-6 shadow-md">
	<h2 class="mb-6 text-2xl font-semibold">Create a New Post</h2>

	<div class="space-y-6">
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

		<!-- Media Upload -->
		<div class="form-control">
			<label class="label" for="file">
				<span class="label-text">Upload Image</span>
			</label>
			<input
				type="file"
				id="file"
				accept="image/*"
				on:change={handleFileChange}
				class="file-input file-input-bordered w-full"
			/>
		</div>

		<!-- Media URL Input -->
		<div class="form-control">
			<label class="label" for="media_url">
				<span class="label-text">Or Enter Media URL (Optional)</span>
			</label>
			<input
				type="text"
				id="media_url"
				bind:value={media_url}
				class="input input-bordered w-full"
				placeholder="Enter image or YouTube URL"
			/>
		</div>

		<!-- Submit Button -->
		<button class="btn btn-primary w-full" on:click={handleSubmit}>Create Post</button>
	</div>
</div>

<script lang="ts">
	import type { UserType } from '$lib';
	import ProfileService from '$lib/services/profiles';
	import { addFlashMessage } from '$lib/stores/flashMessages';
	import { profileEditModal } from '$lib/stores/modals';
	import { supabase } from '$lib/supabase';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import { userProfile } from '$lib/stores/profiles';

	export let user: UserType;

	const isLoading = writable(false);
	let bio = user.bio;

	const editableUser = writable<UserType>(user);
	const refreshFromDiscord = async () => {
		isLoading.set(true);
		const { data, error } = await supabase.auth.getSession();
		if (error) {
			console.error(error);
			return;
		}
		const response = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${data.session?.provider_token}`
			}
		});

		const { username, avatar, id } = await response.json();
		const avatarUrl = avatar
			? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
			: `https://cdn.discordapp.com/embed/avatars/${parseInt(id, 10) % 5}.png`;
		editableUser.set({
			...user,
			full_name: username,
			avatar_url: avatarUrl,
			bio: bio
		});
		isLoading.set(false);
	};
	const saveChanges = () => {
		ProfileService.update(user.id, $editableUser).then((res) => {
			userProfile.set(res);
		});
		profileEditModal.set(false);
		addFlashMessage({
			text: 'Your profile has been updated!',
			type: 'success',
			icon: 'material-symbols:check-circle-outline'
		});
	};

	const onEditBio = () => {
		editableUser.set({
			...user,
			bio: bio
		});
	};
</script>

<div class="modal modal-open">
	<div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
		<div class="flex flex-col gap-4">
			<h2 class="text-2xl font-bold">Edit Your Profile</h2>

			<!-- Profile Edit Form -->
			<div class="space-y-4">
				<!-- Bio Input -->
				<div class="form-control">
					<label for="bio" class="label">
						<span class="label-text text-lg font-semibold">Bio</span>
					</label>
					<textarea
						id="bio"
						bind:value={bio}
						oninput={onEditBio}
						class="textarea textarea-bordered h-24 resize-none"
						placeholder="Tell us something about yourself..."
					></textarea>
				</div>

				<!-- Refresh Button -->
				<button
					onclick={refreshFromDiscord}
					class="btn btn-primary flex w-full items-center gap-2 shadow-md"
				>
					<Icon icon="material-symbols:refresh" class="text-lg" />
					<span>Refresh from Discord</span>
				</button>

				<!-- Preview Section -->
				<div class="card bg-base-200 p-4 shadow-md">
					<h3 class="mb-2 text-lg font-bold">Preview</h3>
					<div class="flex items-center gap-4">
						<!-- Avatar -->
						<div class="h-16 w-16">
							{#if $isLoading}
								<div class="h-full w-full animate-pulse rounded-full bg-base-300"></div>
							{:else}
								<img
									src={$editableUser.avatar_url}
									alt="{$editableUser.full_name}'s avatar"
									class="h-16 w-16 rounded-full border border-base-300 object-cover"
								/>
							{/if}
						</div>

						<!-- User Info -->
						<div class="flex-1 space-y-2 break-words">
							{#if $isLoading}
								<div class="h-6 w-3/4 animate-pulse rounded-md bg-base-300"></div>
								<div class="h-4 w-5/6 animate-pulse rounded-md bg-base-300"></div>
							{:else}
								<h4 class="text-xl font-semibold">{$editableUser.full_name}</h4>
								<p class="text-sm text-base-content/70">{$editableUser.bio}</p>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="modal-action flex flex-wrap gap-4">
				<button class="btn btn-success flex-1" onclick={saveChanges}> Save Changes </button>
				<button
					class="btn btn-outline btn-primary flex-1"
					onclick={() => profileEditModal.set(false)}
				>
					Close
				</button>
			</div>
		</div>
	</div>
</div>

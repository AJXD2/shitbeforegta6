<script lang="ts">
	import { goto } from '$app/navigation';
	import type { UserType } from '$lib';
	import ProfileService from '$lib/services/profiles';
	import { addFlashMessage } from '$lib/stores/flashMessages';
	import { profileEditModal } from '$lib/stores/modals';
	import { supabase } from '$lib/supabase';
	import Icon from '@iconify/svelte';
	import UserChip from './UserChip.svelte';
	import { writable } from 'svelte/store';
	import { userProfile } from '$lib/stores/profiles';

	export let user: UserType;

	let bio = user.bio;

	const editableUser = writable<UserType>(user);
	const refreshFromDiscord = async () => {
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
		console.log(avatar, avatarUrl);
		editableUser.set({
			...user,
			full_name: username,
			avatar_url: avatarUrl,
			bio: bio
		});
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

<div class="card flex w-full max-w-lg bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-lg font-bold">Edit Your Profile</h2>

		<!-- Bio Input -->
		<div class="form-control">
			<label class="label" for="bio">
				<span class="label-text">Bio</span>
			</label>
			<textarea
				id="bio"
				bind:value={bio}
				oninput={onEditBio}
				class="textarea textarea-bordered h-24 resize-none"
				placeholder="Tell us something about yourself..."
			></textarea>
		</div>

		<!-- Buttons -->
		<div class="form-control space-y-6">
			<!-- Refresh Button -->
			<button
				onclick={refreshFromDiscord}
				class="btn btn-primary flex items-center gap-2 shadow-lg"
			>
				<Icon icon="material-symbols:refresh" class="text-lg" />
				<span>Refresh from Discord</span>
			</button>

			<!-- Preview Section -->
			<div class="card bg-base-100 p-4 shadow-md">
				<h2 class="mb-2 text-lg font-bold">Preview:</h2>
				<div class="flex items-center gap-4 rounded-lg bg-base-200 p-4 shadow-md">
					<!-- Avatar -->
					<img
						src={$editableUser.avatar_url}
						alt="{$editableUser.full_name}'s avatar"
						class="h-16 w-16 rounded-full border border-base-300 object-cover"
					/>

					<!-- User Info -->
					<div class="break-words">
						<h3 class="text-xl font-semibold">{$editableUser.full_name}</h3>
						<p class="text-sm text-base-content/70">{$editableUser.bio}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Save Button -->
		<div class="form-control mt-4">
			<button class="btn btn-success" onclick={saveChanges}>Save Changes</button>
		</div>
	</div>
</div>

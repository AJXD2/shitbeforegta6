<script lang="ts">
	import type { UserType } from '$lib';
	import type { Writable } from 'svelte/store';

	export let user: Writable<UserType | null>;
	export let date: string | undefined = undefined;

	function formatDate(dateString: string | undefined): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
			weekday: 'long'
		};

		return date.toLocaleDateString('en-US', options);
	}
</script>

<div class="mb-4 flex items-center gap-4">
	<div class="group avatar relative">
		<div class="h-12 w-12 overflow-hidden rounded-full shadow-lg">
			<img
				src={$user?.avatar_url || 'https://via.placeholder.com/150'}
				alt="User Avatar"
				class="transition-all duration-300 group-hover:rotate-3 group-hover:scale-110"
			/>
		</div>
	</div>
	<div>
		<h3 class="text-lg font-semibold text-primary">{$user?.full_name || ''}</h3>
		{#if date}
			<p class="text-sm text-gray-500">{formatDate(date)}</p>
		{/if}
	</div>
</div>

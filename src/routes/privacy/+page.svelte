<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import { pageTitle } from '$lib/stores/title';
	let markdownContent = '';
	let htmlContent = '';
	pageTitle.set('Privacy Policy');
	async function loadMarkdown(filePath: string) {
		try {
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error('Failed to load markdown file');
			}
			markdownContent = await response.text();
			htmlContent = await marked(markdownContent);
		} catch (error) {
			console.error('Error loading markdown:', error);
		}
	}

	onMount(() => {
		loadMarkdown('/legal/PRIVACY.md');
	});
</script>

<div class="prose mx-auto mt-6 rounded-lg bg-base-100 p-4 shadow-lg">
	<div>{@html htmlContent}</div>
</div>

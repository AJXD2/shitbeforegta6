<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	let markdownContent = '';
	let htmlContent = '';

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
		loadMarkdown('/legal/TOS.md');
	});
</script>

<div class="prose mx-auto mt-6 rounded-lg bg-base-100 p-4 shadow-lg">
	<div>{@html htmlContent}</div>
</div>

<style>
	.prose {
		color: var(--tw-prose-body);
		background-color: #1e293b;
		border: 1px solid #334155;
	}
	.prose h1,
	.prose h2,
	.prose h3,
	.prose h4,
	.prose h5,
	.prose h6 {
		color: #e2e8f0;
	}
	.prose a {
		color: #60a5fa;
	}
	.prose a:hover {
		text-decoration: underline;
	}
	.prose code {
		background-color: #334155;
		color: #f8fafc;
		padding: 0.2em 0.4em;
		border-radius: 4px;
	}
</style>

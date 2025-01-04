<script>
	export let username = 'User';
	export let pfp = 'https://via.placeholder.com/40';
</script>

<div class="flex items-center rounded-full bg-base-200 p-2">
	<img class="mr-2 h-10 w-10 rounded-full" src={pfp} alt="User profile" />
	<span class="text-lg font-bold">{username}</span>
</div>

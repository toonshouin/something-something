<script lang="ts">
	export let hide = false;

	const toggleHide = () => (hide = !hide);
</script>

<div class="group relative transition-all duration-200" class:web-only={hide} class:text-gray-300={hide} class:opacity-40={hide} class:grayscale={hide} role="button">
	<span
		on:click|stopPropagation={toggleHide}
		class="select-none cursor-pointer block h-full w-full"
		class:cursor-copy={hide}
	>
		<slot />
	</span>
</div>

<script lang="ts">
	export let hide = false;

	const toggleHide = (e: MouseEvent) => {
		const target = e.target as HTMLElement | null;
		if (target?.closest('a, button, input, textarea, select')) {
			return;
		}
		hide = !hide;
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative transition-all duration-200"
	class:web-only={hide}
	class:text-gray-300={hide}
	class:opacity-40={hide}
	class:grayscale={hide}
	on:click|stopPropagation={toggleHide}
>
	<span
		class="select-none cursor-pointer block h-full w-full"
		class:cursor-copy={hide}
	>
		<slot />
	</span>
</div>

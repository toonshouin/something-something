<script lang="ts">
	import Hideable from './Hideable.svelte';

	export let name: string = '';
	export let date: string = '';
	export let url: string = '';
	export let verificationUrl: string = '';
</script>

<div class="certification-item my-2 print:my-1 text-left">
	<Hideable>
		<div class="inline-block">
			<span class="font-bold">{name}</span>
			{#if date}
				<span class="text-gray-700 mx-1">-</span>
				<span class="text-gray-700">{date}</span>
			{/if}
			{#if url || verificationUrl}
				<span class="print:hidden">
					<span class="text-gray-700 mx-1">-</span>
					{#if verificationUrl}
						<a href={verificationUrl} target="_blank" rel="noreferrer" class="underline text-sm text-gray-600">[Verify]</a>
					{/if}
					{#if verificationUrl && url}
						<span class="mx-1 text-sm text-gray-600">|</span>
					{/if}
					{#if url}
						<a href={url} target="_blank" rel="noreferrer" class="underline text-sm text-gray-600">[Detail]</a>
					{/if}
				</span>
			{/if}
		</div>
	</Hideable>
</div>

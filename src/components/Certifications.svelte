<script lang="ts">
	import Hideable from './Hideable.svelte';
	import { formatDate } from '$lib/dates';

	export let name: string = '';
	export let date: string = '';
	export let url: string = '';
	export let verificationUrl: string = '';
	export let verificationCode: string = '';
	export let lang: string = 'en';

	$: displayDate = formatDate(date, lang as 'en' | 'th');
</script>

<div class="certification-item my-2 print:my-1 text-left">
	<Hideable>
		<div class="inline-block">
			<span class="font-bold">{name}</span>
			{#if displayDate}
				<span class="text-gray-700 mx-1">-</span>
				<span class="text-gray-700">{displayDate}</span>
			{/if}
			{#if url || verificationUrl}
				<span class="print:hidden">
					<span class="text-gray-700 mx-1">-</span>
					{#if verificationUrl}
						<a
							href={verificationUrl}
							target="_blank"
							rel="noreferrer"
							class="underline text-sm text-gray-600"
							aria-label={verificationCode ? `Verify certificate with code ${verificationCode}` : 'Verify certificate'}
						>[Verify]</a>
						{#if verificationCode}
							<span class="text-xs text-gray-600 font-mono ml-1">(Code: {verificationCode})</span>
						{/if}
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

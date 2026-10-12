<script lang="ts">
	import App from '../components/App.svelte';

	import type { PageData } from './$types';
	export let data: PageData;
</script>

<App profile={data.profile} lang={data.lang} />
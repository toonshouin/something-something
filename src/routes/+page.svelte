<script lang="ts">
	import App from '../components/App.svelte';

	export let data;
</script>

<App profile={data.profile} lang={data.lang} />
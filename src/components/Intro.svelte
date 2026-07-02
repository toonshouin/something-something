<script lang="ts">
	import { fullVersionLink } from "../data";
	import Hideable from "./Hideable.svelte";
	export let name: string = "Foo";
	export let nickname: string = "";
	export let phone: string = "";
	export let email: string = "";
	export let github: string = "";
	export let linkedin: string = "";
	export let location: any = {};
	export let website: string = "";
	export let hidePicture: boolean = false;
	export let lang: string = "en";

	$: isThai = lang === "th";

	$: formattedLocation = (() => {
		if (typeof location === "string") return location;
		if (location.hidden) {
			return [location.province, location.country]
				.filter(Boolean)
				.join(", ");
		}

		const mooPrefix = isThai ? "หมู่ " : "Moo ";
		const soiPrefix = isThai ? "ซอย " : "Soi ";
		const roadSuffix = isThai ? "" : " Rd.";
		const roadPrefix = isThai ? "ถนน" : "";

		return [
			location.house_no,
			location.soi ? `${soiPrefix}${location.soi}` : "",
			location.moo ? `${mooPrefix}${location.moo}` : "",
			location.village,
			location.road ? `${roadPrefix}${location.road}${roadSuffix}` : "",
			location.sub_district,
			location.district,
			location.province,
			location.zip_code,
			location.country,
		]
			.filter(Boolean)
			.join(", ");
	})();
</script>

<div
	class="flex flex-col sm:flex-row print:flex-row items-center sm:items-start print:items-start gap-6 text-sm sm:text-base text-left"
>
	{#if !hidePicture}
		<div class="flex-none order-first print:order-none">
			<Hideable>
				<img
					src={`profile_picture.png`}
					alt={`${name}'s Profile Picture`}
					class="w-32 h-auto rounded-lg border-2 border-gray-200 print:border-gray-800 object-cover"
				/>
			</Hideable>
		</div>
	{/if}

	<div class="flex-1 w-full">
		<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold p-0 mb-1">
			{name}
			<span class="text-lg font-normal text-gray-600">({nickname})</span>
		</h1>
		<div
			class="flex flex-col sm:flex-row print:flex-row gap-4 sm:gap-8 text-gray-700"
		>
			<div class="flex-1">
				<p><a href={`tel:${phone}`}>{phone}</a></p>
				<p><a href={`mailto:${email}`}>{email}</a></p>
				<p>{formattedLocation}</p>
			</div>
			<div class="flex-1">
				<p>
					<a
						href={`https://github.com/${github}`}
						target="_blank"
						rel="noreferrer">github.com/{github}</a
					>
				</p>
				<p>
					<a
						href={`https://${website}`}
						target="_blank"
						rel="noreferrer">{website}</a
					>
				</p>
				<p>
					<a
						href={`https://linkedin.com/in/${linkedin}`}
						target="_blank"
						rel="noreferrer">linkedin.com/in/{linkedin}</a
					>
				</p>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	a {
		text-decoration: underline;
	}
</style>

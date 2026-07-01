<script lang="ts">
	import { page } from "$app/stores";
	import type { IProfileResp } from "../types";
	import Hideable from "./Hideable.svelte";
	import Intro from "./Intro.svelte";
	import Kofi from "./Kofi.svelte";
	import Work from "./Work.svelte";
	import Certifications from "./Certifications.svelte";

	export let profile: IProfileResp;
	export let lang: string;

	$: dataLink = `${fullVersionLink}`;
	$: ({
		headers = {
			coreCompetencies: "Core Competencies",
			workExperience: "Work Experience",
			projects: "Projects",
			education: "Education",
			certifications: "Certifications",
			interests: "Interests",
		},
		intro = {} as IProfileResp["intro"],
		projects = [],
		technologies = [],
		workExperiences = [],
		educations = [],
		certifications = [],
		interests = [],
		resumeUrl: { sourceLink = "", fullVersionLink = "" } = {},
	} = profile || {});

	$: tokenParam = $page.url.searchParams.has("token")
		? `&token=${$page.url.searchParams.get("token")}`
		: "";
</script>

<!-- Remove this is you does not want Kofi widget on your site -->
{#if intro.github == ""}
	<Kofi name={intro.github} />
{/if}

<header
	class="web-only text-center p-4 sm:p-6 bg-indigo-600 text-white w-screen"
>
	<div class="inline-flex items-center gap-2 justify-center">
		<h1 class="text-4xl">Resume</h1>
		<button on:click={() => window.print()} class="underline text-lg"
			>[Print]</button
		>
		<a href={sourceLink} target="_blank" rel="noopener">[Source]</a>
		<a href={`?lang=en${tokenParam}`} class="underline text-lg">[EN]</a>
		<a href={`?lang=th${tokenParam}`} class="underline text-lg">[TH]</a>
	</div>
	<p>
		Printer-friendly standard resume, any HTML tags with <code
			>web-only</code
		> CSS class will be hidden on print.
	</p>
	<p>
		You can click at any sections or lines hide some information before
		printing.
	</p>
</header>

<main
	class="text-center p-4 m-0 md:m-8 xl:mx-auto max-w-screen-xl bg-white print:p-0"
>
	<Intro {...intro} {lang} />

	<article class="mt-6">
		<section>
			<Hideable>
				<p class="text-left leading-relaxed">
					{intro.description}
				</p>
			</Hideable>
		</section>

		<section>
			<Hideable>
				<h2
					class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
				>
					{headers.coreCompetencies}
				</h2>
				<ul class="text-left list-none space-y-1">
					{#each technologies as tech}
						<Hideable>
							<li
								class="flex flex-col sm:flex-row print:flex-row gap-1 sm:gap-2"
							>
								<strong
									class="w-full sm:w-48 print:w-40 flex-none"
									>{tech.section}</strong
								>
								<span class="flex-1">{tech.details}</span>
							</li>
						</Hideable>
					{/each}
				</ul>
			</Hideable>
		</section>

		<section>
			<Hideable>
				<h2
					class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
				>
					{headers.workExperience}
				</h2>
				{#each workExperiences as exp}
					<Work {...exp} />
				{/each}
			</Hideable>
		</section>

		<section>
			<Hideable>
				<h2
					class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
				>
					{headers.projects}
				</h2>
				{#each projects as project}
					<Hideable>
						<div class="mb-3 print:mb-2 text-left">
							<div class="font-bold flex justify-between">
								<span>{project.name}</span>
								{#if project.url}
									<a
										href={`https://${project.url}`}
										target="_blank"
										rel="noreferrer"
										class="font-normal underline"
										>{project.url}</a
									>
								{/if}
							</div>
							<ul class="list-disc pl-8 print:pl-6 mt-1">
								{#each project.bullets as bullet}
									<li>{bullet}</li>
								{/each}
							</ul>
						</div>
					</Hideable>
				{/each}
			</Hideable>
		</section>

		<section>
			<Hideable>
				<h2
					class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
				>
					{headers.education}
				</h2>
				<ul class="text-left space-y-3 print:space-y-2">
					{#each educations as edu}
						<Hideable>
							<li>
								<div class="font-bold">{edu.head}</div>
								<div>
									{edu.details}
									{#if edu.gpa}
										<span class="font-semibold ml-2"
											>GPA: {edu.gpa}</span
										>
									{/if}
								</div>
								{#if edu.relevantCoursework && edu.relevantCoursework.length > 0}
									<div class="text-sm text-gray-700 mt-1">
										<strong>Relevant Coursework:</strong>
										{edu.relevantCoursework.join(", ")}
									</div>
								{/if}
							</li>
						</Hideable>
					{/each}
				</ul>
			</Hideable>
		</section>

		{#if certifications && certifications.length > 0}
			<section>
				<Hideable>
					<h2
						class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
					>
						{headers.certifications}
					</h2>
					{#each certifications as cert}
						<Certifications {...cert} />
					{/each}
				</Hideable>
			</section>
		{/if}

		<section>
			<Hideable>
				<h2
					class="text-xl sm:text-2xl print:text-xl font-bold uppercase text-left text-gray-800 border-b-2 border-gray-300 pb-1 mb-3"
				>
					{headers.interests}
				</h2>
				<ul class="text-left list-disc pl-8 print:pl-6">
					{#each interests as interest}
						<Hideable>
							<li>{interest}</li>
						</Hideable>
					{/each}
				</ul>
			</Hideable>
		</section>
	</article>

	<!-- <footer class="print-only mt-4 pt-2 border-t text-sm text-gray-500">
		(See <a href={fullVersionLink} target="_blank" rel="noopener">full version</a>
		or <a href={sourceLink} target="_blank" rel="noopener">source</a>)
	</footer> -->
</main>

<style lang="postcss">
	main {
		overflow-x: hidden;
	}

	a {
		text-decoration: underline;
	}

	section {
		@apply my-4;
	}

	section h2 {
		@apply font-semibold;
	}

	section hr {
		@apply mt-0 mb-2;
		border-color: darkgrey;
	}

	:global(.print-only) {
		display: none;
	}

	@media print {
		* {
			@apply text-xs;
		}

		:global(.print-only) {
			display: inherit;
		}

		:global(.web-only) {
			display: none;
		}

		ul {
			@apply pl-6;
		}

		section {
			@apply my-2;
		}

		section hr {
			@apply mt-0 mb-1;
		}

		main {
			margin: 0 0;
			padding: 0;
		}

		@page {
			size: A4;
			margin: 1cm;
		}
	}
</style>

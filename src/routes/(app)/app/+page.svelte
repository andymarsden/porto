<script>
	import AppHeader from "$lib/components/app-header.svelte";

	let { data } = $props();
	let draftFavoriteTeam = $state(data.favoriteTeam);

	$effect(() => {
		draftFavoriteTeam = data.favoriteTeam;
	});
</script>

<div class="px-4 pt-4">
	<h2 class="text-xl font-semibold">{data.favoriteTeam}</h2>

	<form method="POST" class="mt-3 flex max-w-md gap-2">
		<input
			name="favoriteTeam"
			type="text"
			bind:value={draftFavoriteTeam}
			class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
		/>
		<button
			type="submit"
			class="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm font-medium"
		>Save</button>
	</form>
</div>

<AppHeader
	crumbs={[{ label: "Build Your Application", href: "##" }]}
	currentPage="Data Fetching"
/>
<!-- <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
	</div>
	<div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min"></div>
</div> -->
<div class="flex flex-1 flex-col gap-4 px-4 py-10">
	<div class="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl"></div>
	<div class="bg-muted/50 mx-auto h-full w-full max-w-3xl rounded-xl"></div>
</div>

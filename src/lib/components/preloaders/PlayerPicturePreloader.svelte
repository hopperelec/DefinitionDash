<script lang="ts">
import DefaultPFP from "$lib/media/default_pfp.svg";

export let players: { picture: string | null }[];
</script>

<svelte:head>
	{#each new Set(Object.values(players).map((player) => player.picture)) as picture}
		{#if picture}
			<link
				as="image"
				href={picture}
				rel="preload"
				referrerpolicy="no-referrer"
			/>
		{:else}
			<link as="image" href={DefaultPFP} rel="preload" />
		{/if}
	{/each}
</svelte:head>

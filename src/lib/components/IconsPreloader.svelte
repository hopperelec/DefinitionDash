<script lang="ts">
import PlayerPicturePreloader from "$lib/components/PlayerPicturePreloader.svelte";
import PointIcon from "$lib/media/point.svg";

export let players: { picture: string | null }[];
</script>

<PlayerPicturePreloader {players} />
<svelte:head>
	<link as="image" href={PointIcon} rel="preload" />
</svelte:head>

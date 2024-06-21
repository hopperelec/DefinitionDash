<script lang="ts">
import PlayerPicturePreloader from "$lib/components/PlayerPicturePreloader.svelte";
import { POINT_ICON } from "$lib/constants.js";

export let players: { picture: string | null }[];
</script>

<PlayerPicturePreloader {players} />
<svelte:head>
  <link as="image" href={POINT_ICON} rel="preload" />
</svelte:head>

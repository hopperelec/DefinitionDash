<script lang="ts">
  import { POINT_ICON } from "$lib/constants.js";
  import PlayerPicturePreloader from "$lib/components/PlayerPicturePreloader.svelte";

  export let players: { picture: string | null }[];
</script>

<PlayerPicturePreloader {players} />
<svelte:head>
  <link as="image" href={POINT_ICON} rel="preload" />
</svelte:head>

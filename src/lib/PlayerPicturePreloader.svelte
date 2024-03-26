<script lang="ts">
  import { DEFAULT_USER_ICON } from "$lib/constants.js";

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
      <link as="image" href={DEFAULT_USER_ICON} rel="preload" />
    {/if}
  {/each}
</svelte:head>

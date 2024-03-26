<script lang="ts">
  import type { LeaderboardPlayer } from "$lib/types";
  import Kickable from "$lib/Kickable.svelte";

  export let orderedPlayers: LeaderboardPlayer[];
</script>

<h3>Leaderboard</h3>
<ol>
  {#each orderedPlayers as player}
    <li>
      {#if player.kickable}
        <Kickable userId={player.id}>
          <span>{player.name}</span> -
          <span>{player.points} point{player.points === 1 ? "" : "s"}</span>
        </Kickable>
      {:else}
        <span>{player.name}</span> -
        <span>{player.points} point{player.points === 1 ? "" : "s"}</span>
      {/if}
    </li>
  {/each}
</ol>

<style>
  h3 {
    width: 100%;
    margin: 0 10px;
    text-align: center;
    font-family: var(--default-font-family-bold);
  }

  ol {
    overflow-y: auto;
    margin-left: 10px; /* Counter li padding */
  }

  li {
    margin-right: 10px; /* Prevent overflow for Kickable hover */
  }
</style>

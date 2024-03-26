<script lang="ts">
  import type { PlayerLabelProps } from "$lib/types";
  import KickablePlayerLabel from "$lib/KickablePlayerLabel.svelte";

  export let currentUserId: number;
  export let allowKicking = false;
  export let orderedPlayers: PlayerLabelProps[];
</script>

<h3>Leaderboard</h3>
<ol>
  {#each orderedPlayers as player}
    <li>
      <KickablePlayerLabel {currentUserId} {allowKicking} {player} />
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
    font-size: 24px;
    overflow-y: auto;
    margin: 0 0 0 10px; /* Counter li padding */
  }

  li {
    padding: 5px 0;
    margin-right: 10px; /* Prevent overflow for Kickable hover */
  }
</style>

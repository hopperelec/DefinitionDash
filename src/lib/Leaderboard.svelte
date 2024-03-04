<script lang="ts">
  export let orderedPlayers: {
    name: string;
    points: number;
  }[];
</script>

<h3>Leaderboard</h3>
<ol>
  {#each orderedPlayers as player}
    <li>
      <span>{player.name}</span> -
      <span>{player.points} point{player.points === 1 ? "" : "s"}</span>
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
  }
</style>

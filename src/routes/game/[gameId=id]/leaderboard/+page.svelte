<script lang="ts">
  import Leaderboard from "$lib/Leaderboard.svelte";
  import ablyClientStore from "$lib/ably-client";
  import { page } from "$app/stores";
  import "$lib/button.css";

  export let data;

  const players = data.players.reduce(
    (acc, player) => {
      acc[player.id] = {
        name: player.name || "User " + player.id,
        points: player.points,
      };
      return acc;
    },
    {} as { [key: number]: { name: string; points: number } },
  );
  $: orderedPlayers = Object.values(players).sort(
    (a, b) => b.points - a.points,
  );

  ablyClientStore.subscribe(async (ablyClient) => {
    if (!ablyClient) return;
    await ablyClient.channels
      .get("game:" + $page.params.gameId + ":points")
      .subscribe((message) => {
        switch (message.name) {
          case "points":
            players[message.data.userId].points = message.data.points;
            break;
        }
      });
  });
</script>

<div id="page-container">
  <div id="leaderboard-container">
    <Leaderboard {orderedPlayers} />
  </div>
  <a class="button" href="../">Back to game</a>
</div>

<style>
  #page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #leaderboard-container {
    height: 100%;
  }
</style>

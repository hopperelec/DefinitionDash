<script lang="ts">
  import Leaderboard from "$lib/Leaderboard.svelte";
  import { getChannel } from "$lib/ably-client";
  import { page } from "$app/stores";
  import "$lib/button.css";

  export let data;

  function getDisplayName(userId: number, name: string | null) {
    return name || "User " + userId;
  }

  const players = data.players.reduce(
    (acc, player) => {
      acc[player.id] = {
        name: getDisplayName(player.id, player.name),
        points: player.points,
      };
      return acc;
    },
    {} as { [key: number]: { name: string; points: number } },
  );
  $: orderedPlayers = Object.values(players).sort(
    (a, b) => b.points - a.points,
  );

  const pointsMessage = getChannel("game:" + $page.params.gameId + ":points")
  $: if ($pointsMessage) {
    switch ($pointsMessage.name) {
      case "points":
        players[$pointsMessage.data.userId].points = $pointsMessage.data.points;
        break;
      case "create":
        players[$pointsMessage.data.userId] = {
          name: getDisplayName($pointsMessage.data.userId, $pointsMessage.data.name),
          points: 0
        }
    }
  }
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

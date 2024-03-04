<script lang="ts">
  import Leaderboard from "$lib/Leaderboard.svelte";
  import SVGMap from "$lib/SVGMap.svelte";
  import { DEFAULT_USER_ICON } from "$lib/constants";
  import "$lib/button.css";

  export let data;
  let map: SVGMap;

  function getCardinal(position: number) {
    if (position === 1) {
      return "won";
    }
    const lastDigit = position % 10;
    const lastTwoDigits = position % 100;
    let suffix = "th";
    if (lastDigit === 1) {
      if (lastTwoDigits !== 11) suffix = "st";
    } else if (lastDigit === 2) {
      if (lastTwoDigits !== 12) suffix = "nd";
    } else if (lastDigit === 3) {
      if (lastTwoDigits !== 13) suffix = "rd";
    }
    return "came "+position+suffix;
  }

  function onMapSuccess() {
    for (const player of data.players) {
      map.addIconTo(player.currSvgRef, player.picture || DEFAULT_USER_ICON);
    }
  }
</script>

<div id="end-container">
  <h2>Game over!</h2>
  <p>You {getCardinal(data.leaderboardPosition)}!</p>
  <div id="leaderboard-container">
    <Leaderboard orderedPlayers={data.players}/>
  </div>
  <div id="map-container">
    <SVGMap bind:this={map} imgURL={data.mapImgURL} onSuccess={onMapSuccess}/>
  </div>
  <a class="button" href="/game">New game</a>
</div>

<style>
  #end-container {
    height: 100vh;
    display: grid;
    grid-template-rows: auto auto minmax(0,1fr) auto;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-items: center;
  }

  h2 {
    font-family: var(--default-font-family-bold);
    margin: 0;
  }

  h2, p, a {
    grid-column-start: 1;
    grid-column-end: 3;
  }

  #map-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #leaderboard-container {
    max-height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>

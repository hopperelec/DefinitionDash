<script lang="ts">
  import type { PageData } from "./$types";
  import SVGMap from "$lib/SVGMap.svelte";

  export let data: PageData;
  let map: SVGMap;
  let position: number | undefined;

  function movePlayerIcon(
    playerId: number,
    playerPicture: string | null,
    roomId: number,
  ) {
    const prevIcon = map.getElmWhere("player", playerId) as SVGImageElement;
    if (prevIcon) map.removeIcon(prevIcon);
    const newIcon = map.addIconTo(roomId, playerPicture || "/default_pfp.svg");
    if (newIcon) {
      newIcon.dataset.player = playerId.toString();
    }
  }

  $: if (position !== undefined) {
    movePlayerIcon(data.user.id, data.user.picture, position);
  }
</script>

<SVGMap bind:this={map} mapData={data.map} onClickRoom={clickedRoom => position = clickedRoom} onSuccess={() => position = 1}/>

<svelte:head>
  <style>
    [data-player] {
      clip-path: inset(0% round 50%);
    }
  </style>
</svelte:head>

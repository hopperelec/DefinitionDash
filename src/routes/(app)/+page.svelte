<script lang="ts">
  import type { PageData } from "./$types";
  import SVGMap from "$lib/SVGMap.svelte";
  import { error } from "@sveltejs/kit";

  export let data: PageData;
  if (!data.map) throw error(403, "You do not have access to any maps!");
  let map: SVGMap;
  let position: number | undefined;

  const doors = data.map.doors.reduce((acc: { [key: number]: number[] }, door) => {
    acc[door.room1_id] = acc[door.room1_id] || [];
    acc[door.room1_id].push(door.room2_id);
    return acc;
  }, {});

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

  function canMoveTo(room: number) {
    if (!position) return false;
    const room1_id = Math.min(position, room);
    const room2_id = Math.max(position, room);
    return doors[room1_id] && doors[room1_id].includes(room2_id);
  }

  function onClickRoom(clickedRoom: number) {
    if (canMoveTo(clickedRoom)) position = clickedRoom;
  }

  function onSuccess() {
    position = 1;
    map.getSVG().addEventListener("mousemove", event => {
      const hoveredRoom = map.getEventRoom(event);
      map.getSVG().style.cursor = hoveredRoom ? (canMoveTo(hoveredRoom) ? "pointer" : "not-allowed") : "";
    });
  }

  $: if (position !== undefined) {
    movePlayerIcon(data.user.id, data.user.picture, position);
  }
</script>

<SVGMap bind:this={map} mapData={data.map?.data} {onClickRoom} {onSuccess}/>

<svelte:head>
  <style>
    [data-player] {
      clip-path: inset(0% round 50%);
    }
  </style>
</svelte:head>

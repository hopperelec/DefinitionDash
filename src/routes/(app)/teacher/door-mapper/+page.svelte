<script lang="ts">
  import type { PageData } from "./$types";
  import SVGMap from "$lib/SVGMap.svelte";
  import { SVG_NS } from "$lib/constants";
  import { error } from "@sveltejs/kit";
  import type { LocalDoor } from "$lib/types";

  export let data: PageData;
  if (!data.map) throw error(403, "You do not have access to any maps!");
  const lines: { [key: number]: { [key: number]: SVGLineElement } } = {}; // First key is room1_id, second key is room2_id
  let map: SVGMap;
  let firstRoom: number;
  let firstRoomCenter: DOMPoint | undefined;

  function drawLine(
    door: LocalDoor,
    firstRoomCenter?: DOMPoint,
    secondRoomCenter?: DOMPoint,
  ) {
    if (firstRoomCenter && secondRoomCenter) {
      const line = map
        .getSVG()
        .appendChild(document.createElementNS(SVG_NS, "line"));
      line.setAttribute("x1", firstRoomCenter.x.toString());
      line.setAttribute("y1", firstRoomCenter.y.toString());
      line.setAttribute("x2", secondRoomCenter.x.toString());
      line.setAttribute("y2", secondRoomCenter.y.toString());
      line.classList.add("door-line");
      if (!lines[door.room1_id]) lines[door.room1_id] = {};
      lines[door.room1_id][door.room2_id] = line;
    }
  }

  async function onClickRoom(clickedRoom: number) {
    if (!firstRoomCenter) {
      firstRoom = clickedRoom;
      firstRoomCenter = map.getCenterOf(clickedRoom);
    } else {
      const secondRoomCenter = map.getCenterOf(clickedRoom);
      const door = {
        room1_id: Math.min(firstRoom, clickedRoom),
        room2_id: Math.max(firstRoom, clickedRoom),
      };
      if (lines[door.room1_id] && lines[door.room1_id][door.room2_id]) {
        lines[door.room1_id][door.room2_id].remove();
        delete lines[door.room1_id][door.room2_id];
        await fetch("/teacher/door-mapper/remove-door", {
          method: "POST",
          body: JSON.stringify(door),
          headers: { "content-type": "application/json" },
        });
      } else if (clickedRoom !== firstRoom) {
        drawLine(door, firstRoomCenter, secondRoomCenter);
        await fetch("/teacher/door-mapper/add-door", {
          method: "POST",
          body: JSON.stringify(door),
          headers: { "content-type": "application/json" },
        });
      }
      firstRoomCenter = undefined;
    }
  }

  function onMapSuccess() {
    if (data.map) {
      for (const door of data.map.doors) {
        drawLine(
          door,
          map.getCenterOf(door.room1_id),
          map.getCenterOf(door.room2_id),
        );
      }
    }
  }
</script>

<SVGMap
  bind:this={map}
  mapData={data.map?.data}
  {onClickRoom}
  onSuccess={onMapSuccess}
/>

<svelte:head>
  <style>
    /* noinspection CssUnusedSymbol */
    .door-line {
      stroke: black;
    }

    [data-room]:hover {
      cursor: pointer;
    }
  </style>
</svelte:head>

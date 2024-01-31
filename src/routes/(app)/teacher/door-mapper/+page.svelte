<script lang="ts">
  import type { PageData } from "./$types";
  import SVGMap from "$lib/SVGMap.svelte";
  import { SVG_NS } from "$lib/constants";
  import type { LocalDoor } from "$lib/types";

  export let data: PageData;
  const lines: { [key: number]: { [key: number]: SVGLineElement } } = {}; // First key is room1Id, second key is room2Id
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
      if (!lines[door.svgRef1Id]) lines[door.svgRef1Id] = {};
      lines[door.svgRef1Id][door.svgRef2Id] = line;
    }
  }

  async function onClickRoom(clickedRoom: number) {
    if (!firstRoomCenter) {
      firstRoom = clickedRoom;
      firstRoomCenter = map.getCenterOf(clickedRoom);
    } else {
      const secondRoomCenter = map.getCenterOf(clickedRoom);
      const door = {
        svgRef1Id: Math.min(firstRoom, clickedRoom),
        svgRef2Id: Math.max(firstRoom, clickedRoom),
      };
      if (lines[door.svgRef1Id] && lines[door.svgRef1Id][door.svgRef2Id]) {
        lines[door.svgRef1Id][door.svgRef2Id].remove();
        delete lines[door.svgRef1Id][door.svgRef2Id];
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
    for (const door of data.doors) {
      drawLine(
        door,
        map.getCenterOf(door.svgRef1Id),
        map.getCenterOf(door.svgRef2Id),
      );
    }
  }
</script>

<SVGMap
  bind:this={map}
  mapData={data.mapData}
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

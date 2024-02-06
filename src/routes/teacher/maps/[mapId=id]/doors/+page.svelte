<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import { SVG_NS } from "$lib/constants";
  import type { LocalDoor } from "$lib/types";

  export let data;
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
      if (!lines[door.svgRef1]) lines[door.svgRef1] = {};
      lines[door.svgRef1][door.svgRef2] = line;
    }
  }

  async function onClickRoom(clickedRoom: number) {
    if (!firstRoomCenter) {
      firstRoom = clickedRoom;
      firstRoomCenter = map.getCenterOf(clickedRoom);
    } else {
      const secondRoomCenter = map.getCenterOf(clickedRoom);
      const door = {
        svgRef1: Math.min(firstRoom, clickedRoom),
        svgRef2: Math.max(firstRoom, clickedRoom),
      };
      if (lines[door.svgRef1] && lines[door.svgRef1][door.svgRef2]) {
        lines[door.svgRef1][door.svgRef2].remove();
        delete lines[door.svgRef1][door.svgRef2];
        await fetch(door.svgRef1 + "/" + door.svgRef2, {
          method: "DELETE",
        });
      } else if (clickedRoom !== firstRoom) {
        drawLine(door, firstRoomCenter, secondRoomCenter);
        await fetch(door.svgRef1 + "/" + door.svgRef2, {
          method: "PUT",
        });
      }
      firstRoomCenter = undefined;
    }
  }

  function onMapSuccess() {
    for (const door of data.map.doors) {
      drawLine(
        door,
        map.getCenterOf(door.svgRef1),
        map.getCenterOf(door.svgRef2),
      );
    }
  }
</script>

<SVGMap
  bind:this={map}
  imgURL={data.map.imgURL}
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

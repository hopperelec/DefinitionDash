<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import { SVG_NS } from "$lib/constants";
  import type { LocalDoor } from "$lib/types";
  import decodeDoors from "$lib/decode-doors";

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

  async function onMapSuccess() {
    const doors = await fetch("/maps/" + data.mapId + "/doors")
      .then((response) => response.arrayBuffer())
      .then(decodeDoors);
    for (const [svgRef1, svgRef2s] of Object.entries(doors)) {
      for (const svgRef2 of svgRef2s) {
        const door = { svgRef1: +svgRef1, svgRef2 };
        drawLine(door, map.getCenterOf(door.svgRef1), map.getCenterOf(svgRef2));
      }
    }
  }
</script>

<SVGMap
  bind:this={map}
  imgURL={data.mapURL}
  {onClickRoom}
  onSuccess={onMapSuccess}
/>

<svelte:head>
  <link as="fetch" crossorigin="anonymous" href="/maps/{data.mapId}/doors" rel="preload">
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

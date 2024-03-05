<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import { SVG_NS } from "$lib/constants";
  import decodeDoors from "$lib/decode-doors";
  import { page } from "$app/stores";

  export let data;
  const lines: { [key: number]: { [key: number]: SVGLineElement } } = {}; // First key is room1Id, second key is room2Id
  let map: SVGMap;
  let _firstRoom: number = 0;

  function drawLine(svgRef1: number, svgRef2: number) {
    const firstRoomCenter = map.getCenterOf(svgRef1);
    const secondRoomCenter = map.getCenterOf(svgRef2);
    if (firstRoomCenter && secondRoomCenter) {
      const line = map
        .getSVG()
        .appendChild(document.createElementNS(SVG_NS, "line"));
      line.setAttribute("x1", firstRoomCenter.x.toString());
      line.setAttribute("y1", firstRoomCenter.y.toString());
      line.setAttribute("x2", secondRoomCenter.x.toString());
      line.setAttribute("y2", secondRoomCenter.y.toString());
      line.classList.add("door-line");
      if (!lines[svgRef1]) lines[svgRef1] = {};
      lines[svgRef1][svgRef2] = line;
    }
  }

  async function onClickRoom(clickedRoom: number) {
    if (!_firstRoom) {
      _firstRoom = clickedRoom;
    } else {
      const svgRef1 = Math.min(_firstRoom, clickedRoom);
      const svgRef2 = Math.max(_firstRoom, clickedRoom);
      if (lines[svgRef1] && lines[svgRef1][svgRef2]) {
        lines[svgRef1][svgRef2].remove();
        delete lines[svgRef1][svgRef2];
        await fetch(svgRef1 + "/" + svgRef2, {
          method: "DELETE",
        });
      } else if (clickedRoom !== _firstRoom) {
        drawLine(svgRef1, svgRef2);
        await fetch(svgRef1 + "/" + svgRef2, {
          method: "PUT",
        });
      }
      _firstRoom = 0;
    }
  }

  async function onMapSuccess() {
    const doors = await fetch("/maps/" + $page.params.mapId + "/doors")
      .then((response) => response.arrayBuffer())
      .then(decodeDoors);
    for (const [svgRef1, svgRef2s] of Object.entries(doors)) {
      for (const svgRef2 of svgRef2s) {
        drawLine(+svgRef1, svgRef2);
      }
    }
  }
</script>

<div id="map-container">
  <SVGMap
    bind:this={map}
    imgURL={data.mapURL}
    {onClickRoom}
    onSuccess={onMapSuccess}
  />
</div>

<svelte:head>
  <link
    as="fetch"
    crossorigin="anonymous"
    href="/maps/{$page.params.mapId}/doors"
    rel="preload"
  />
  <style>
    /* noinspection CssUnusedSymbol */
    .door-line {
      stroke: black;
    }

    [data-room]:hover {
      cursor: pointer;
      filter: brightness(1.5);
    }
  </style>
</svelte:head>

<style>
  #map-container {
    position: fixed;
    height: 100vh;
    width: 100vw;
  }
</style>

<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  let mapElm: SVGSVGElement;
  let position = 156;
  const ICON_SIZE = 16;
  const SVG_NS = "http://www.w3.org/2000/svg";

  function getElmWhere(dataName: string, dataValue: number): SVGGraphicsElement | null {
    return mapElm.querySelector(`[data-${dataName}='${dataValue}']`);
  }
  function getRoom(id: number): SVGGraphicsElement | null {
    return getElmWhere("room", id) as SVGGraphicsElement;
  }
  function getLabelsFor(roomId: number): IterableIterator<HTMLElement> | null {
    return mapElm.querySelectorAll(`[data-label-for='${roomId}']`).values() as IterableIterator<HTMLElement>;
  }

  function removeIcon(icon: SVGImageElement) {
    if (icon.parentElement && icon.parentElement.childElementCount === 1) {
      const labels = getLabelsFor(Number(icon.parentElement.dataset.iconFor));
      if (labels) {
        for (const label of labels) {
          label.style.display = "block";
        }
      }
    }
    icon.remove();
  }

  function addIconTo(roomId: number, iconSrc: string) {
    const room = getRoom(roomId);
    if (!room) return;

    const labels = getLabelsFor(roomId);
    if (labels) {
      for (const label of labels) {
        label.style.display = "none";
      }
    }

    let iconContainer = getElmWhere("icon-for", roomId);
    if (!iconContainer) {
      iconContainer = mapElm.appendChild(document.createElementNS(SVG_NS, "g"));
      iconContainer.dataset.iconFor = roomId.toString();
    }

    const icon = document.createElementNS(SVG_NS, "image");
    icon.href.baseVal = iconSrc;
    icon.setAttribute("width", ICON_SIZE.toString());
    icon.setAttribute("height", ICON_SIZE.toString());
    iconContainer.appendChild(icon);

    const roomBBox = room.getBBox();
    let center = new DOMPoint(roomBBox.x + roomBBox.width/2, roomBBox.y + roomBBox.height/2);
    const roomCTM = room.getCTM();
    const svgCTM = mapElm.getCTM();
    if (roomCTM && svgCTM) {
      center = center.matrixTransform(svgCTM.inverse().multiply(roomCTM));
    }
    const iconContainerBBox = iconContainer.getBBox();
    center.x -= iconContainerBBox.width/2;
    center.y -= iconContainerBBox.height/2;

    iconContainer.setAttribute("transform", `translate(${center.x}, ${center.y})`);
    return icon;
  }

  function movePlayerIcon(playerId: number, playerPicture: string | null, roomId: number) {
    const prevIcon = getElmWhere("player", playerId) as SVGImageElement;
    if (prevIcon) removeIcon(prevIcon);
    const newIcon = addIconTo(roomId, playerPicture || "/default_pfp.svg");
    if (newIcon) newIcon.dataset.player = playerId.toString();
  }

  export let data: PageData;
  onMount(() => {
    if (data.map) {
      const mapContainer = document.getElementById("map-container");
      if (mapContainer) {
        const tempMapElm = new DOMParser().parseFromString(data.map, "image/svg+xml").documentElement;
        if (tempMapElm instanceof SVGSVGElement) {
          mapElm = tempMapElm;
          mapElm.onclick = event => {
            if (event.target instanceof SVGElement) {
              let clickedRoom = event.target.dataset.room;
              if (!clickedRoom) clickedRoom = event.target.parentElement?.dataset.room
              if (clickedRoom) {
                position = Number(clickedRoom);
                movePlayerIcon(data.user.id, data.user.picture, position);
              }
            }
          }
          mapContainer.append(mapElm);
          movePlayerIcon(data.user.id, data.user.picture, position);
        } else {
          mapContainer.appendChild(document.createTextNode("Error: Invalid map! Must be SVG."));
        }
      }
    }
  });
</script>

<div id="map-container"></div>

<svelte:head>
  <style>
      body {
          margin: 0;
      }

      #map-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }

      [data-room]:hover {
          filter: brightness(1.5);
          cursor: pointer;
      }

      /* noinspection CssUnusedSymbol */
      .roomLabels, [data-icon-for] {
          pointer-events: none;
      }

      [data-player] {
          clip-path: inset(0% round 50%);
      }
  </style>
</svelte:head>

<script lang="ts">
  import { onMount } from "svelte";
  import { ICON_SIZE, SVG_NS } from "$lib/constants";

  let container: HTMLElement;
  let svg: SVGSVGElement;

  export function getSVG() {
    return svg;
  }

  export function getEventRoom(event: MouseEvent) {
    if (event.target instanceof SVGElement) {
      return +(
        event.target.dataset.room ||
        event.target.parentElement?.dataset.room ||
        0
      );
    }
  }

  export function getElmWhere(
    dataName: string,
    dataValue: number,
  ): SVGGraphicsElement | null {
    return svg.querySelector(`[data-${dataName}='${dataValue}']`);
  }
  export function getRoom(id: number): SVGGraphicsElement | null {
    return getElmWhere("room", id) as SVGGraphicsElement;
  }
  export function getLabelsFor(
    roomId: number,
  ): IterableIterator<HTMLElement> | null {
    return svg
      .querySelectorAll(`[data-label-for='${roomId}']`)
      .values() as IterableIterator<HTMLElement>;
  }

  export function removeIcon(icon: SVGImageElement) {
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

  export function getCenterOf(roomId: number) {
    const room = getRoom(roomId);
    if (!room) return;
    const roomBBox = room.getBBox();
    let center = new DOMPoint(
      roomBBox.x + roomBBox.width / 2,
      roomBBox.y + roomBBox.height / 2,
    );
    const roomCTM = room.getCTM();
    const svgCTM = svg.getCTM();
    if (roomCTM && svgCTM) {
      center = center.matrixTransform(svgCTM.inverse().multiply(roomCTM));
    }
    return center;
  }

  export function addIconTo(roomId: number, iconSrc: string) {
    const center = getCenterOf(roomId);
    if (!center) return;

    const labels = getLabelsFor(roomId);
    if (labels) {
      for (const label of labels) {
        label.style.display = "none";
      }
    }

    const icon = document.createElementNS(SVG_NS, "image");
    icon.href.baseVal = iconSrc;
    icon.setAttribute("width", ICON_SIZE.toString());
    icon.setAttribute("height", ICON_SIZE.toString());

    let iconContainer = getElmWhere("icon-for", roomId);
    if (iconContainer) {
      icon.setAttribute(
        "transform",
        `translate(${iconContainer.childElementCount * ICON_SIZE / 2})`, // Overlap icons slightly
      );
    } else {
      iconContainer = svg.appendChild(document.createElementNS(SVG_NS, "g"));
      iconContainer.dataset.iconFor = roomId.toString();
    }
    iconContainer.appendChild(icon);

    const iconContainerBBox = iconContainer.getBBox();
    center.x -= iconContainerBBox.width / 2;
    center.y -= iconContainerBBox.height / 2;

    iconContainer.setAttribute(
      "transform",
      `translate(${center.x}, ${center.y})`,
    );
    return icon;
  }

  export let imgURL: string | undefined;
  export let onSuccess = () => {};
  export let onError = (message: string) => {
    (container || document.body).appendChild(
      document.createTextNode("Error: " + message),
    );
  };
  export let onClickRoom: ((clickedRoom: number) => void) | undefined;

  onMount(async () => {
    if (imgURL) {
      const tempMapContainer = document.getElementById("map-container");
      if (!tempMapContainer) onError("Failed to get map container");
      container = tempMapContainer!;
      const tempMapElm = new DOMParser().parseFromString(
        await (await fetch(imgURL)).text(),
        "image/svg+xml",
      ).documentElement;
      if (tempMapElm instanceof SVGSVGElement) {
        container.innerHTML = "";
        svg = container.appendChild(tempMapElm);
        svg.addEventListener("click", (event) => {
          if (onClickRoom) {
            let clickedRoom = getEventRoom(event);
            if (clickedRoom) onClickRoom(clickedRoom);
          }
        });
        onSuccess();
      } else {
        onError("Invalid map! Must be SVG.");
      }
    } else {
      onError("Not given map image URL");
    }
  });
</script>

<div id="map-container">
  <p>Loading map...</p>
</div>

<svelte:head>
  <link as="fetch" crossorigin="anonymous" href={imgURL} rel="preload" />
  <style>
    [data-room]:hover {
      filter: brightness(1.5);
    }

    [data-label-for],
    [data-icon-for] {
      pointer-events: none;
    }
  </style>
</svelte:head>

<style lang="scss">
  #map-container {
    position: fixed;
    top: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: -1;

    & > p {
      font-family: var(--default-font-family-bold);
      font-size: 4em;
    }
  }
</style>

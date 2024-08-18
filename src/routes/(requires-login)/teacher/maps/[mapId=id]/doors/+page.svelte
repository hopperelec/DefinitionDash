<script lang="ts">
import { page } from "$app/stores";
import type SVGMap from "$lib/components/SVGMap.svelte";
import SVGMapComponent from "$lib/components/SVGMap.svelte";
import { SVG_NS } from "$lib/constants";
import decodeDoors from "$lib/decode-doors";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";

title.set("Doors mapper");

export let data: PageData;
const lines: { [key: number]: { [key: number]: SVGLineElement } } = {}; // First key is room1Id, second key is room2Id
let map: SVGMap;
let firstRoom = 0;

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
	if (!firstRoom) {
		firstRoom = clickedRoom;
	} else {
		const svgRef1 = Math.min(firstRoom, clickedRoom);
		const svgRef2 = Math.max(firstRoom, clickedRoom);
		if (lines[svgRef1]?.[svgRef2]) {
			lines[svgRef1][svgRef2].remove();
			delete lines[svgRef1][svgRef2];
			await fetch(`${svgRef1}/${svgRef2}`, {
				method: "DELETE",
			});
		} else if (clickedRoom !== firstRoom) {
			drawLine(svgRef1, svgRef2);
			await fetch(`${svgRef1}/${svgRef2}`, {
				method: "PUT",
			});
		}
		firstRoom = 0;
	}
}

async function onMapLoad() {
	const doors = await fetch(`/maps/${$page.params.mapId}/doors`)
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
	<SVGMapComponent
		bind:this={map}
		imgURL={data.mapURL}
		{onClickRoom}
		onLoad={onMapLoad}
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
			stroke-width: 1;
			vector-effect: non-scaling-stroke;
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

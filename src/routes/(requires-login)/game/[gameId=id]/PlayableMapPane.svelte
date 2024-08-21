<script lang="ts">
// biome-ignore lint/style/useImportType: Used as component
import SVGMap from "$lib/components/SVGMap.svelte";
import "$lib/styles/button.css";
import MinimizeButton from "$lib/components/split-panes/MinimizeButton.svelte";
import PaneTitle from "$lib/components/split-panes/PaneTitle.svelte";
import PaneTitleBar from "$lib/components/split-panes/PaneTitleBar.svelte";
import decodeDoors from "$lib/decode-doors";
import DefaultPFP from "$lib/media/default_pfp.svg";
import PointIcon from "$lib/media/point.svg";
import type { Doors } from "$lib/types";
import { type Readable, type Writable, writable } from "svelte/store";

export let currUserId: number;
export let mapData: {
	id: number;
	imgURL: string;
};
export let players: Readable<{
	[key: number]: {
		picture: string | null;
		currSvgRef: number;
	};
}>;
export let claimedRooms: Set<number>;
export let currMove: Writable<number | undefined>;
export let minimize: () => void;

let map: SVGMap;
let doors: Doors;

const focusAccessibleRooms = writable(true);
function unFocus() {
	map.getSVG().classList.remove("dd-unfocus");
	for (const dimElm of [...map.getSVG().getElementsByClassName("dd-focus")]) {
		dimElm.classList.remove("focus");
	}
}
function focus() {
	map.getSVG().classList.add("dd-unfocus");
	const currSvgRef = $players[currUserId].currSvgRef;
	focusRoom(currSvgRef);
	if (currSvgRef in doors) {
		for (const svgRef2 of doors[currSvgRef]) {
			focusRoom(svgRef2);
		}
	}
	for (const [svgRef1, svgRef2s] of Object.entries(doors)) {
		if (svgRef2s.has(currSvgRef)) {
			focusRoom(+svgRef1);
		}
	}
}
function focusRoom(svgRef: number) {
	const containerElms = [];
	const room = map.getElmWhere("room", svgRef);
	if (room) containerElms.push(room);
	const labels = map.getLabelsFor(svgRef);
	if (labels) containerElms.push(...labels);

	const elmsToFocus = [];
	for (const containerElm of containerElms) {
		if (containerElm) {
			if (containerElm.tagName === "g" || containerElm.tagName === "svg") {
				elmsToFocus.push(...containerElm.querySelectorAll(":not(g,svg)"));
			} else {
				elmsToFocus.push(containerElm);
			}
		}
	}

	const icon = map.getElmWhere("icon-for", svgRef);
	if (icon) elmsToFocus.push(icon);

	for (const elmToFocus of elmsToFocus) {
		elmToFocus.classList.add("dd-focus");
	}
}

export function addPlayerIcon(userId: number, svgRef: number) {
	if (map) {
		const newIcon = map.addIconTo(
			svgRef,
			$players[userId].picture || DefaultPFP,
		);
		if (newIcon) newIcon.dataset.user = userId.toString();
	}
}

export function removePlayerIcon(userId: number) {
	if (map) {
		const icon = map.getElmWhere("user", userId) as SVGImageElement;
		if (icon) map.removeIcon(icon);
	}
}

export function movePlayerIcon(userId: number, svgRef: number) {
	removePlayerIcon(userId);
	addPlayerIcon(userId, svgRef);
	if (userId === currUserId) {
		unFocus();
		focus();
	}
}

export function addPointIcon(svgRef: number) {
	if (map) {
		const icon = map.addIconTo(svgRef, PointIcon);
		if (icon) icon.dataset.point = svgRef.toString();
	}
}

export function removePointIcon(svgRef: number) {
	if (map) {
		const pointIcon = map.getElmWhere("point", svgRef) as SVGImageElement;
		if (pointIcon) map.removeIcon(pointIcon);
	}
}

function canMoveTo(svgRef: number) {
	if (!doors) return false;
	const svgRef1 = Math.min($players[currUserId].currSvgRef, svgRef);
	const svgRef2 = Math.max($players[currUserId].currSvgRef, svgRef);
	return doors[svgRef1]?.has(svgRef2);
}

async function onClickRoom(clickedSvgRef: number) {
	if (!$currMove && canMoveTo(clickedSvgRef)) {
		currMove.set(clickedSvgRef);
	}
}

async function onMapLoad() {
	for (const [userId, player] of Object.entries($players)) {
		addPlayerIcon(+userId, player.currSvgRef);
	}
	for (const roomElm of map.getSVG().querySelectorAll("[data-room]")) {
		const svgRef = (roomElm as HTMLElement).dataset.room;
		if (svgRef && !claimedRooms.has(+svgRef)) {
			addPointIcon(+svgRef);
		}
	}
	map.getSVG().addEventListener("mousemove", (event) => {
		const hoveredSvgRef = map.getEventRoom(event);
		map.getSVG().style.cursor = hoveredSvgRef
			? canMoveTo(hoveredSvgRef)
				? "pointer"
				: "not-allowed"
			: "";
	});
	// I'd prefer for this to be done outside the pane, in-case the same map is shown multiple times,
	// However, I couldn't figure out an intuitive way to do this.
	doors = await fetch(`/maps/${mapData.id}/doors`)
		.then((response) => response.arrayBuffer())
		.then(decodeDoors);
	focusAccessibleRooms.subscribe((_focusAccessibleRooms) => {
		if (_focusAccessibleRooms) focus();
		else unFocus();
	});
}
</script>

<PaneTitleBar>
	<PaneTitle>Map</PaneTitle>
	<input type="checkbox" id="dim-inaccessible-rooms" bind:checked={$focusAccessibleRooms}/>
	<label for="dim-inaccessible-rooms">Dim inaccessible rooms</label>
	<MinimizeButton {minimize}/>
</PaneTitleBar>
<div id="map-container">
	<SVGMap
		bind:this={map}
		imgURL={mapData.imgURL}
		{onClickRoom}
		onLoad={onMapLoad}
	/>
</div>

<svelte:head>
	<style>
		/*
		  If I just dim all elements which aren't focused, like so:
			```css
			.dd-unfocus :not(.dd-focus) { ... }
			```
			then it'll still dim elements which *contain* a focused element. It would also dim nested elements multiple times.

			To get around this, I exclude container elements.
			```css
			.dd-unfocus :not(g, svg, .dd-focus) { ... }
			```

			However, I use a container for icons and it would be impractical to focus each icon as they get added.
      So, I also specifically exclude root-level icon containers if they are focused.
			```scss
			.dd-unfocus >:not([data-icon-for].dd-focus) {
				&, & * {
					&:not(g, svg, .dd-focus) { ... }
				}
			}
			```

			However, SVG elements can be re-used (e.g: <use>), meaning the above could dim an element which later gets re-used as a focused element.
			While I can't really get around this, most re-used elements go in the root-level `<defs>` container so I also exclude that.
		*/
		.dd-unfocus >:not(defs, [data-icon-for].dd-focus) {
			&, & * {
				&:not(g, svg, .dd-focus) {
					filter: brightness(.3);
				}
			}
		}

		[data-room]:hover {
			filter: brightness(1.5);
		}

		[data-user] {
			clip-path: inset(0% round 50%);
		}
	</style>
</svelte:head>

<style>
#map-container {
	flex: 1;
	overflow: auto; /* I'm not sure why but this fixes the height */
}
</style>

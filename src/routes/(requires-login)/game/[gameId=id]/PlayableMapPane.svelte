<script lang="ts">
// biome-ignore lint/style/useImportType: Used as component
import SVGMap from "$lib/components/SVGMap.svelte";
import "$lib/styles/button.css";
import DefaultPFP from "$lib/media/default_pfp.svg";
import PointIcon from "$lib/media/point.svg";
import type { Doors } from "$lib/types";
import type { Readable, Writable } from "svelte/store";

export let currUserId: number;
export let mapImgURL: string;
export let players: Readable<{
	[key: number]: {
		picture: string | null;
		currSvgRef: number;
	};
}>;
export let claimedRooms: Set<number>;
export let currMove: Writable<number | undefined>;
export let doors: Readable<Doors>;

let map: SVGMap;

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
	const svgRef1 = Math.min($players[currUserId].currSvgRef, svgRef);
	const svgRef2 = Math.max($players[currUserId].currSvgRef, svgRef);
	return $doors[svgRef1]?.has(svgRef2);
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
}
</script>

<SVGMap
	bind:this={map}
	imgURL={mapImgURL}
	{onClickRoom}
	onLoad={onMapLoad}
/>

<svelte:head>
	<style>
		[data-room]:hover {
			filter: brightness(1.5);
		}

		[data-user] {
			clip-path: inset(0% round 50%);
		}
	</style>
</svelte:head>


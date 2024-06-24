<script lang="ts">
import Leaderboard from "$lib/components/Leaderboard.svelte";
import SVGMapComponent from "$lib/components/SVGMap.svelte";
import type SVGMap from "$lib/components/SVGMap.svelte";
import DefaultPFP from "$lib/media/default_pfp.svg";
import PointIcon from "$lib/media/point.svg";
import "$lib/styles/button.css";
import IconsPreloader from "$lib/components/IconsPreloader.svelte";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";

title.set("Game over!");

export let data: PageData;
let map: SVGMap;

// won, came 1st, came 2nd, came 3rd, came 4th...
function getCardinal(position: number) {
	if (position === 1) {
		return "won";
	}
	const lastDigit = position % 10;
	const lastTwoDigits = position % 100;
	let suffix = "th";
	if (lastDigit === 1) {
		if (lastTwoDigits !== 11) suffix = "st";
	} else if (lastDigit === 2) {
		if (lastTwoDigits !== 12) suffix = "nd";
	} else if (lastDigit === 3) {
		if (lastTwoDigits !== 13) suffix = "rd";
	}
	return `came ${position}${suffix}`;
}

function onMapLoad() {
	for (const player of data.players) {
		const icon = map.addIconTo(player.currSvgRef, player.picture || DefaultPFP);
		if (icon) {
			icon.classList.add("user");
		}
	}

	for (const roomElm of map.getSVG().querySelectorAll("[data-room]")) {
		const svgRef = (roomElm as HTMLElement).dataset.room;
		if (svgRef && !data.claimedRooms.includes(+svgRef)) {
			map.addIconTo(+svgRef, PointIcon);
		}
	}
}
</script>

<div id="end-container">
	<h2>Game over!</h2>
	<p>You {getCardinal(data.leaderboardPosition)}!</p>
	<div id="center-container">
		<div id="leaderboard-container">
			<Leaderboard currentUserId={data.userId} orderedPlayers={data.players} />
		</div>
		<div id="map-container">
			<SVGMapComponent
				bind:this={map}
				imgURL={data.mapImgURL}
				onLoad={onMapLoad}
			/>
		</div>
	</div>

	<!--
		Causes a console error and doesn't use CSR
		https://github.com/sveltejs/kit/issues/12398
	-->
	<a class="button" href="/game">New game</a>
</div>
<IconsPreloader players={data.players} />

<svelte:head>
	<style>
		/* noinspection CssUnusedSymbol */
		.user {
			clip-path: inset(0% round 50%);
		}
	</style>
</svelte:head>

<style>
#end-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
}

h2 {
	font-family: var(--default-font-family-bold);
	margin: 0;
}

p {
	margin-top: 0;
}

#center-container {
	flex-grow: 1;
	width: 100%;
	display: grid;
	place-items: center;

	& > * {
		min-width: 0;
		box-sizing: border-box;
	}
}

#center-container,
#leaderboard-container {
	/* Prevent overflow */
	min-height: 0;
	max-height: 100%;
}

#map-container {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: auto;
}

#leaderboard-container {
	display: flex;
	flex-direction: column;
	max-width: 100%;
}

@media (aspect-ratio > 1) {
	#center-container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	#leaderboard-container {
		padding-right: 15px;
	}

	#map-container {
		padding-left: 15px;
	}
}

@media (aspect-ratio < 1) {
	#center-container {
		grid-template-rows: repeat(2, minmax(0, 1fr));
	}

	#leaderboard-container {
		padding-bottom: 15px;
	}

	#map-container {
		padding-top: 15px;
	}
}
</style>

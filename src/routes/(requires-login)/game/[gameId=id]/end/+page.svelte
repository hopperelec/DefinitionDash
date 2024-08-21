<script lang="ts">
import SVGMap from "$lib/components/SVGMap.svelte";
import Leaderboard from "$lib/components/leaderboard/Leaderboard.svelte";
import IconsPreloader from "$lib/components/preloaders/IconsPreloader.svelte";
import DefinitionDashSplitPanes from "$lib/components/split-panes/SplitPanes.svelte";
import { createPane } from "$lib/components/split-panes/types";
import StatusBar from "$lib/components/status-bar/StatusBar.svelte";
import StatusBarSeparator from "$lib/components/status-bar/StatusBarSeparator.svelte";
import DefaultPFP from "$lib/media/default_pfp.svg";
import PointIcon from "$lib/media/point.svg";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";

title.set("Game over!");

export let data: PageData;

let width: number;
let height: number;
$: columnMode = width / height < 1.3;

const mapPane = createPane(
	"Map",
	SVGMap,
	{ imgURL: data.mapImgURL, onLoad: onMapLoad },
	true,
);
let panes = [
	mapPane,
	createPane(
		"Leaderboard",
		Leaderboard,
		{ currUserId: data.userId, players: data.players },
		true,
	),
];

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
	const map = mapPane.binding as SVGMap;
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
	<StatusBar>
		<StatusBarSeparator/>
		<span>Game over. You {getCardinal(data.leaderboardPosition)}!</span>
		<!--
			Causes a console error and doesn't use CSR
			https://github.com/sveltejs/kit/issues/12398
		-->
		<div id="right-align">
			<a href="/">Home page</a>
			<StatusBarSeparator/>
			<a href="/game">New game</a>
		</div>
	</StatusBar>
	<div id="panes-container" bind:clientWidth={width} bind:clientHeight={height}>
		<DefinitionDashSplitPanes {panes} {columnMode} showTabBar={false}/>
	</div>
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
}

#panes-container {
	min-height: 0;
	flex-grow: 1;
}

span {
	font-weight: bold;
}

#right-align {
	margin-left: auto;
	display: flex;
	align-items: center;
}

a {
	text-decoration: none;
	font-weight: bold;
	color: inherit;
}
</style>

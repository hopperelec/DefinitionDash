<script lang="ts">
import { page } from "$app/stores";
import { getChannel } from "$lib/ably-client";
import IconsPreloader from "$lib/components/IconsPreloader.svelte";
import TwoDimensionalPanes from "$lib/components/TwoDimensionalPanes.svelte";
import decodeDoors from "$lib/decode-doors";
import { title } from "$lib/page-meta.js";
import { type TwoDimensionalPaneProps, createPane } from "$lib/types";
import { onMount } from "svelte";
import { derived, writable } from "svelte/store";
import type { PageData } from "./$types";
import AnswerPane from "./AnswerPane.svelte";
import PlayableMap from "./PlayableMapPane.svelte";
import LeaderboardPane from "./ReactiveLeaderboardPane.svelte";
import Shop from "./ShopPane.svelte";
import "$lib/styles/status-bar.css";
import StatusBar from "$lib/components/StatusBar.svelte";
import StatusBarSeparator from "$lib/components/StatusBarSeparator.svelte";

title.set(undefined);

export let data: PageData;
let players = writable(data.players);
let currPoints = derived(players, () => $players[data.userId].points);
const currMove = writable(data.currMove);

let columnMode = true;
let ptsChangeContainer: HTMLElement;

function addPtsChangeGlyph(amount: number) {
	const elm = ptsChangeContainer.appendChild(document.createElement("span"));
	if (amount > 0) {
		elm.innerText = `+${amount}`;
		elm.style.color = "green";
	} else {
		elm.innerText = amount.toString();
		elm.style.color = "red";
	}
	setTimeout(() => elm.remove(), 1000);
}

let playableMap = createPane(
	"Map",
	PlayableMap,
	{
		currUserId: data.userId,
		mapImgURL: data.map.imgURL,
		players,
		claimedRooms: data.claimedRooms,
		currMove,
	},
	true,
	true,
	true,
);
let answerPane = createPane(
	"Answer",
	AnswerPane,
	{
		currQuestion: data.currQuestion,
		currMove,
	},
	true,
	true,
	true,
);

let panes: TwoDimensionalPaneProps = [
	[playableMap, answerPane],
	[
		createPane(
			"Shop",
			Shop,
			{ shopItems: data.shopItems, currPoints },
			true,
			true,
			true,
		),
		createPane(
			"Leaderboard",
			LeaderboardPane,
			{ currUserId: data.userId, players },
			true,
			true,
			true,
		),
	],
];

$: if ($currMove) {
	answerPane.shown = true;
	// biome-ignore lint/correctness/noSelfAssign: trigger reactivity
	panes = panes;
}

const realtimeMessage = getChannel(`game:${$page.params.gameId}`);
$: if ($realtimeMessage) {
	switch ($realtimeMessage.name) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause:
		case "create":
			$players[$realtimeMessage.data.userId] = {
				name: $realtimeMessage.data.name,
				picture: $realtimeMessage.data.picture,
				currSvgRef: $realtimeMessage.data.svgRef,
				points: 0,
				isHost: false,
			};
		case "move": {
			const svgRef = $realtimeMessage.data.svgRef;
			$players[$realtimeMessage.data.userId].currSvgRef = svgRef;
			(playableMap.binding as PlayableMap).movePlayerIcon(
				$realtimeMessage.data.userId,
				svgRef,
			);
			if (!data.claimedRooms.has(svgRef)) {
				data.claimedRooms.add(svgRef);
				(playableMap.binding as PlayableMap).removePointIcon(svgRef);
			}
			break;
		}

		case "points":
			if ($realtimeMessage.data.userId === data.userId)
				addPtsChangeGlyph(
					$realtimeMessage.data.points - $players[data.userId].points,
				);
			$players[$realtimeMessage.data.userId].points =
				$realtimeMessage.data.points;
			break;

		case "unclaim":
			for (const svgRef of $realtimeMessage.data) {
				data.claimedRooms.delete(svgRef);
				(playableMap.binding as PlayableMap).addPointIcon(svgRef);
			}
			break;

		case "kick": {
			const userId = $realtimeMessage.data.userId;
			delete $players[userId];
			(playableMap.binding as PlayableMap).removePlayerIcon(userId);
		}
	}
}

onMount(async () => {
	(playableMap.binding as PlayableMap).doors = await fetch(
		`/maps/${data.map.id}/doors`,
	)
		.then((response) => response.arrayBuffer())
		.then(decodeDoors);
});
</script>

<div id="page-container">
	<StatusBar>
		<StatusBarSeparator/>
		<span>Game ID: {$page.params.gameId}</span>
		<StatusBarSeparator/>
		<span>Points: {$players[data.userId].points}</span>
		<div bind:this={ptsChangeContainer} id="pts-change-container"></div>
		{#if $players[data.userId].isHost}
			<a href="end">End game</a>
		{/if}
	</StatusBar>
	<TwoDimensionalPanes {panes} {columnMode}/>
</div>

<IconsPreloader players={Object.values(data.players)}/>
<svelte:head>
	<link
		as="fetch"
		crossorigin="anonymous"
		href="/maps/{data.map.id}/doors"
		rel="preload"
	/>
	<style>
		#pts-change-container > * {
			position: absolute;
			animation: fly-up-and-fade-out 1s ease-out forwards;
		}

		@keyframes fly-up-and-fade-out {
			100% {
				transform: translateY(-100%);
				opacity: 0;
			}
		}
	</style>
</svelte:head>

<style lang="scss">
#page-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
}

a {
	margin-left: auto;
	text-decoration: none;
	font-weight: bold;
	color: red;
}
</style>
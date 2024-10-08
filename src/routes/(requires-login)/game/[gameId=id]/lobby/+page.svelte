<script lang="ts">
import PlayerPicturePreloader from "$lib/components/preloaders/PlayerPicturePreloader.svelte";
import DefaultPFP from "$lib/media/default_pfp.svg";
import "$lib/styles/button.css";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { getChannel } from "$lib/ably-client";
import KickablePlayerLabel from "$lib/components/player-label/KickablePlayerLabel.svelte";
import type { PlayerLabelProps } from "$lib/components/player-label/types";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";

title.set("Lobby");

export let data: PageData;

// Restructure loaded players data to be keyed by ID
let players = data.players.reduce(
	(acc, player) => {
		acc[player.id] = player;
		return acc;
	},
	{} as { [key: number]: PlayerLabelProps },
);
$: isHost = players[data.userId].isHost;

function leavePlayer(userId: number) {
	delete players[userId];
	// biome-ignore lint/correctness/noSelfAssign: trigger reactivity
	players = players;
}

const realtimeMessage = getChannel(`lobby:${$page.params.gameId}`);
$: if ($realtimeMessage) {
	switch ($realtimeMessage.name) {
		case "start":
			goto("../");
			break;
		case "join":
			players[$realtimeMessage.data.id] = {
				id: $realtimeMessage.data.id,
				name: $realtimeMessage.data.name,
				picture: $realtimeMessage.data.picture || DefaultPFP,
				isHost: false,
			};
			break;
		case "leave":
			leavePlayer($realtimeMessage.data.userId);
			break;
		case "host": {
			const userId = $realtimeMessage.data.userId;
			players[userId].isHost = true;
			if (userId === data.userId) {
				isHost = true;
				alert(
					"The previous host left the game, so you have been assigned as the new host!",
				);
			}
		}
	}
}

const announcement = getChannel(`game:${$page.params.gameId}:announcements`);
$: if ($announcement?.name === "kick") {
	leavePlayer($announcement.data.userId);
}

function isOnlyHost() {
	return Object.entries(players).some(
		([id, player]) => player.isHost && +id !== data.userId,
	);
}

function leaveGame() {
	if (
		!isHost ||
		Object.keys(players).length === 1 ||
		confirm(
			`${
				isOnlyHost()
					? "You are the only host in this game. If you leave, a random player will be made the new host"
					: "You are currently a host of this game. If you leave, even if you rejoin, you will no longer be a host"
			}. Are you sure you want to leave?`,
		)
	)
		goto("leave");
}
</script>

<div id="page-container">
	<div id="lobby-container">
		<h2>Lobby</h2>
		<h3>Game ID: <span>{$page.params.gameId}</span></h3>
		<div id="buttons-container">
			{#if isHost}
				<!--
					Causes a console error and doesn't use CSR
					https://github.com/sveltejs/kit/issues/12398
				-->
				<a class="button" href="start">Start game</a>
			{/if}
			<button class="button" on:click={leaveGame} type="button">
				Leave game
			</button>
		</div>
		<ul>
			{#each Object.values(players) as player}
				<li>
					<KickablePlayerLabel
						currUserId={data.userId}
						allowKicking={isHost}
						{player}
					/>
				</li>
			{/each}
		</ul>
	</div>
</div>

<PlayerPicturePreloader players={data.players} />

<style>
#page-container {
	height: 100vh;
	font-family: var(--default-font-family);
}

div {
	display: flex;
}

#page-container,
#lobby-container {
	flex-direction: column;
	align-items: center;
}

#buttons-container {
	flex-wrap: wrap;
	justify-content: center;
}

#lobby-container {
	width: 100%;

	@media (width >= 1060px) {
		width: 1060px;
	}
}

h2, h3 {
	margin: 0;
}

h2 {
	font-size: 2em;
	font-family: var(--default-font-family-bold);
}

ul {
	padding: 0;
	margin: 0 10px;
	max-width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fit, 1fr);
	font-size: 1.3em;
}

li {
	list-style-type: none;
	padding: 5px 0;
}
</style>

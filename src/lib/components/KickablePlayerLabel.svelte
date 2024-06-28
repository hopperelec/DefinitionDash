<script lang="ts">
import { page } from "$app/stores";
import PlayerLabel from "$lib/components/PlayerLabel.svelte";
import type { PlayerLabelProps } from "$lib/types";

export let currUserId: number;
export let allowKicking = false;
export let player: PlayerLabelProps;

async function kickPlayer(userId: number) {
	const res = await fetch(`/game/${$page.params.gameId}/kick/${userId}/`, {
		method: "POST",
	});
	if (!res.ok) alert((await res.json()).message);
}
</script>

{#if allowKicking && player.id !== currUserId && !player.isHost}
	<button
		on:click={async () => await kickPlayer(player.id)}
		tabindex="0"
		type="button"
	>
		<PlayerLabel {player} {currUserId} />
	</button>
{:else}
	<PlayerLabel {player} {currUserId} />
{/if}

<style>
button {
	border: 0;
	padding: 0;
	background: none;
	position: relative;
	font: inherit;

	&:hover {
		cursor: pointer;

		/* Strikethrough, including icons */
		&::after {
			content: "";
			position: absolute;
			width: calc(100% + 1em);
			top: 50%;
			left: -.5em;
			border-top: 2px solid black;
		}
	}
}
</style>

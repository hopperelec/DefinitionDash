<script lang="ts">
import DefaultPFP from "$lib/media/default_pfp.svg";
import type { PlayerLabelProps } from "./types";

export let currUserId: number;
export let player: PlayerLabelProps;
const name = player.name || `User ${player.id}`;
</script>

<div
	class:current-user={player.id === currUserId}
	class:host={player.isHost}
	id="label-container"
>
	<img
		alt="{name}'s picture"
		src={player.picture || DefaultPFP}
	/>
	<span>
		<span class="name" title={name}>{name}</span>
		{#if player.points !== undefined}
			<span class="separator">-</span>
			<span>{player.points} points</span>
		{/if}
	</span>
</div>

<style>
#label-container {
	display: inline-flex;
	vertical-align: middle;
	align-items: center;
	max-width: 100%;

	& > img {
		height: 1.5em;
		clip-path: inset(0% round 50%);
	}

	& > span {
		margin: 0 .25em;

		/* Prevent overflow */
		display: flex;
		min-width: 0;
		white-space: nowrap;
	}
}

.name {
	overflow-x: hidden;
	text-overflow: ellipsis;
}

.separator {
	padding: 0 .5em;
}

.host {
	color: orange;
}

.current-user {
	color: blue;
}
</style>

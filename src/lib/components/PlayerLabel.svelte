<script lang="ts">
import type { PlayerLabelProps } from "$lib/types";
import { DEFAULT_USER_ICON } from "$lib/constants";

export let currentUserId: number;
export let player: PlayerLabelProps;
let name = player.name || "User " + player.id;
</script>

<div
	class:current-user={player.id === currentUserId}
	class:host={player.isHost}
	id="label-container"
>
	<img
		alt="{name}'s picture"
		height="32"
		src={player.picture || DEFAULT_USER_ICON}
		width="32"
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
	font-size: 24px;
	max-width: 100%;

	& > img {
		clip-path: inset(0% round 50%);
	}

	& > span {
		margin-left: 10px;
		margin-right: 20px;

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
	padding: 0 10px;
}

.host {
	color: orange;
}

.current-user {
	color: blue;
}
</style>

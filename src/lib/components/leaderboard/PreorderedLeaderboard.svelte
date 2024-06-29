<script lang="ts">
import KickablePlayerLabel from "$lib/components/player-label/KickablePlayerLabel.svelte";
import type { PreorderedLeaderboardPlayer } from "./types";

export let currUserId: number;
export let allowKicking = false;
export let orderedPlayers: PreorderedLeaderboardPlayer[];
</script>

<ol>
	{#each orderedPlayers as player}
		<li>
			<KickablePlayerLabel {currUserId} {allowKicking} {player} />
		</li>
	{/each}
</ol>

<style>
ol {
	overflow: hidden auto;
	margin: 0;
}

li {
	padding: .25em 0;
	margin-right: .5em; /* Prevent overflow for Kickable hover */
}
</style>

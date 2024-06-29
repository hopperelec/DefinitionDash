<script lang="ts">
import PreorderedLeaderboard from "$lib/components/leaderboard/PreorderedLeaderboard.svelte";
import type { LeaderboardPlayers } from "./types";

export let currUserId: number;
export let allowKicking = false;
export let players: LeaderboardPlayers;
$: orderedPlayers = Object.entries(players)
	.map(([id, player]) => ({ id: +id, ...player }))
	.toSorted((a, b) => b.points - a.points);
</script>

<PreorderedLeaderboard {currUserId} {allowKicking} {orderedPlayers}/>
<script lang="ts">
import Leaderboard from "$lib/components/Leaderboard.svelte";
import type { LeaderboardPlayers } from "$lib/types.js";
import type { Readable } from "svelte/store";

export let currUserId: number;
export let players: Readable<LeaderboardPlayers>;
</script>

<Leaderboard {currUserId} allowKicking players={$players}/>
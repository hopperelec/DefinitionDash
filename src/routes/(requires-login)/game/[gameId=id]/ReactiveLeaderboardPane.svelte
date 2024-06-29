<script lang="ts">
import Leaderboard from "$lib/components/leaderboard/Leaderboard.svelte";
import type { LeaderboardPlayers } from "$lib/components/leaderboard/types";
import type { Readable } from "svelte/store";

export let currUserId: number;
export let players: Readable<LeaderboardPlayers>;
</script>

<Leaderboard {currUserId} allowKicking players={$players}/>
<script lang="ts">
import Leaderboard from "$lib/components/leaderboard/Leaderboard.svelte";
import type { LeaderboardPlayers } from "$lib/components/leaderboard/types";
import MinimizeButton from "$lib/components/split-panes/MinimizeButton.svelte";
import PaneTitle from "$lib/components/split-panes/PaneTitle.svelte";
import PaneTitleBar from "$lib/components/split-panes/PaneTitleBar.svelte";
import type { Readable } from "svelte/store";

export let currUserId: number;
export let players: Readable<LeaderboardPlayers>;
export let minimize: () => void;
</script>

<PaneTitleBar>
	<PaneTitle>Leaderboard</PaneTitle>
	<MinimizeButton {minimize}/>
</PaneTitleBar>
<Leaderboard {currUserId} allowKicking players={$players}/>

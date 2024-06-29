import type { PlayerLabelProps } from "$lib/components/player-label/types";

export type PreorderedLeaderboardPlayer = PlayerLabelProps & { points: number };
export type LeaderboardPlayers = {
	[key: number]: Omit<PreorderedLeaderboardPlayer, "id">;
};
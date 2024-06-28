import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";

export type LocalDoor = { svgRef1: number; svgRef2: number };

export type PlayerLabelProps = {
	id: number;
	name: string | null;
	picture: string | null;
	points?: number;
	isHost: boolean;
};

export type PreorderedLeaderboardPlayer = PlayerLabelProps & { points: number };
export type LeaderboardPlayers = {
	[key: number]: Omit<PreorderedLeaderboardPlayer, "id">;
};

export type Doors = { [key: number]: Set<number> };

export type Definition = {
	wordClass: string | null;
	definition: string;
	usageTemplate: string | null;
};

export type DefinitionDashPaneProps<
	T extends SvelteComponent = SvelteComponent,
> = {
	name: string;
	component: ComponentType<T>;
	componentProps: ComponentProps<T>;
	shown: boolean;
	showName: boolean;
	allowClosing: boolean;
	binding?: T;
};
export function createPane<T extends SvelteComponent>(
	name: string,
	component: ComponentType<T>,
	componentProps: ComponentProps<T>,
	shown?: boolean,
	showName?: boolean,
	allowClosing?: boolean,
): DefinitionDashPaneProps<T> {
	return {
		name,
		component,
		componentProps,
		shown: !!shown,
		showName: !!showName,
		allowClosing: !!allowClosing,
	};
}
export type TwoDimensionalPaneProps = DefinitionDashPaneProps[][];

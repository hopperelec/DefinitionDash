import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";

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
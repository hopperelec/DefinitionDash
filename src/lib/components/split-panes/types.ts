import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";

export type PaneProps<T extends SvelteComponent = SvelteComponent> = {
	name: string;
	component: ComponentType<T>;
	componentProps: Omit<ComponentProps<T>, "minimize">;
	shown: boolean;
	binding?: T;
};
export function createPane<T extends SvelteComponent>(
	name: string,
	component: ComponentType<T>,
	componentProps: Omit<ComponentProps<T>, "minimize">,
	shown?: boolean,
): PaneProps<T> {
	return {
		name,
		component,
		componentProps,
		shown: !!shown,
	};
}

<script lang="ts">
import { Pane } from "svelte-splitpanes";
import type { PaneProps } from "./types";

export let props: PaneProps;
</script>

<Pane>
	<div>
		<svelte:component
			this={props.component} bind:this={props.binding}
			{...props.componentProps} minimize={() => props.shown = !props.shown}
		/>
	</div>
</Pane>

<style>
div {
	display: flex;
	flex-direction: column;
	height: 100%;
}
</style>
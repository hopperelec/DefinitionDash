<script lang="ts">
import { Pane } from "svelte-splitpanes";
import type { DefinitionDashPaneProps } from "./types";

export let props: DefinitionDashPaneProps;
</script>

<Pane>
	<div id="pane">
		{#if props.showName || props.allowClosing}
			<div id="bar">
				{#if props.showName}
					<span id="name">{props.name}</span>
				{/if}
				{#if props.allowClosing}
					<button type="button" on:click={() => props.shown = !props.shown}>
						<span>&#9473;</span>
					</button>
				{/if}
			</div>
		{/if}
		<div id="component">
			<svelte:component this={props.component} {...props.componentProps} bind:this={props.binding}/>
		</div>
	</div>
</Pane>

<style lang="scss">
#pane {
	display: flex;
	flex-direction: column;
	height: 100%;
}

#bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid #aaa;
	background: #d8d8d8;
	font-family: "Segoe UI", Arial, sans-serif;
}

#name {
	padding: 0 .5em;
}

button {
	font-weight: bold;
	background: none;
	border: none;
	aspect-ratio: 1 / 1;
	line-height: 1em;
	padding: .2em;
	cursor: pointer;

	& > span {
		padding: .2em;
		border-radius: 25%;
	}

	&:hover > span {
		background-color: #fff;
	}
}

#component {
	position: relative;
	flex-grow: 1;
	overflow: auto; /* I'm not sure why but this fixes the height of SVGMap */
}
</style>
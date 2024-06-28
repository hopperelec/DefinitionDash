<script lang="ts">
import DefinitionDashPane from "$lib/components/DefinitionDashPane.svelte";
import type { TwoDimensionalPaneProps } from "$lib/types";
import { Pane, Splitpanes } from "svelte-splitpanes";
import "$lib/styles/status-bar.css";
import StatusBarSeparator from "$lib/components/StatusBarSeparator.svelte";

export let panes: TwoDimensionalPaneProps;
export let columnMode = false;
</script>

{#if panes.flat().some(pane => pane.allowClosing)}
	<div class="status-bar">
		<input type="checkbox" id="column-mode" bind:checked={columnMode}/>
		<label for="column-mode">Column mode</label>
		<StatusBarSeparator/>
		<ul id="tabs">
			{#each panes.flat() as tab}
				<StatusBarSeparator/>
				<li class:open={tab.shown}>
					<button type="button" on:click={() => tab.shown = !tab.shown}>{tab.name}</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}
<Splitpanes theme="" horizontal={!columnMode}>
	{#each panes as group} <!-- Group is a column in column mode, and a row otherwise -->
		{#if group.some(pane => pane.shown)}
			<Pane>
				<Splitpanes theme="" horizontal={columnMode}>
					{#each group as pane}
						{#if pane.shown}
							<DefinitionDashPane bind:props={pane}/>
						{/if}
					{/each}
				</Splitpanes>
			</Pane>
		{/if}
	{/each}
</Splitpanes>

<svelte:head>
	<!--suppress CssUnusedSymbol -->
	<style>
		/* stylelint-disable */
		.splitpanes {
			min-height: 0;
		}

		.splitpanes > .splitpanes__pane {
			transition: none;
		}
		.splitpanes__splitter {
			background-color: black;
			position: relative;
		}
		.splitpanes__splitter:before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			transition: opacity .4s;
			background-color: black;
			opacity: 0;
		}
		.splitpanes__splitter:hover:before {
			opacity: 1;
		}
		.splitpanes--vertical > .splitpanes__splitter:before {
			left: -2px;
			right: -2px;
			height: 100%;
			cursor: col-resize;
		}
		.splitpanes--horizontal > .splitpanes__splitter:before {
			top: -2px;
			bottom: -2px;
			width: 100%;
			cursor: row-resize;
		}
		/* stylelint-enable */
	</style>
</svelte:head>

<style>
#tabs {
	display: flex;
	align-items: center;
	padding: 0;
	margin: 0;

	& > li {
		list-style: none;

		& > button {
			padding: 0 0 0 .5em;
			background: none;
			border: none;
			cursor: pointer;
		}

		&.open > button {
			font-weight: bold;
		}
	}
}
</style>
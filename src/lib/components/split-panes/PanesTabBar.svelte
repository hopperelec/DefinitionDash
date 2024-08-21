<script lang="ts">
import StatusBarSeparator from "$lib/components/status-bar/StatusBarSeparator.svelte";
import type { PaneProps } from "./types";

export let columnMode: boolean;
export let panes: PaneProps[] | PaneProps[][];
</script>

<div class="status-bar">
	<input type="checkbox" id="column-mode" bind:checked={columnMode}/>
	<label for="column-mode">Column mode</label>
	<ul id="tabs">
		{#each panes.flat() as tab}
			<StatusBarSeparator/>
			<li class:open={tab.shown}>
				<button type="button" on:click={() => tab.shown = !tab.shown}>{tab.name}</button>
			</li>
		{/each}
	</ul>
</div>

<style>
#tabs {
	display: flex;
	align-items: center;
	padding: 0;
	margin: 0;

	& > li {
		list-style: none;

		& > button {
			padding: 0;
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
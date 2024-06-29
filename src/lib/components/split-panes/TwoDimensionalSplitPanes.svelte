<script lang="ts">
import { Pane, Splitpanes } from "svelte-splitpanes";
import "$lib/styles/status-bar.css";
import PanesTabBar from "$lib/components/split-panes/PanesTabBar.svelte";
import DefinitionDashSplitPanes from "$lib/components/split-panes/SplitPanes.svelte";
import type { DefinitionDashPaneProps } from "$lib/components/split-panes/types";

export let panes: DefinitionDashPaneProps[][];
export let columnMode = false;
export let showTabBar: "never" | "for-closing" | "always" = "for-closing";
</script>

{#if showTabBar !== "never" && (showTabBar === "always" || panes.flat().some(pane => pane.allowClosing))}
	<PanesTabBar bind:columnMode={columnMode} bind:panes={panes}/>
{/if}
<Splitpanes theme="" horizontal={!columnMode}>
	{#each panes as group} <!-- Group is a column in column mode, and a row otherwise -->
		{#if group.some(pane => pane.shown)}
			<Pane>
				<DefinitionDashSplitPanes bind:panes={group} {columnMode} showTabBar="never"/>
			</Pane>
		{/if}
	{/each}
</Splitpanes>


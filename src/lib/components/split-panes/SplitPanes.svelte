<script lang="ts">
import DefinitionDashPane from "$lib/components/split-panes/Pane.svelte";
import PanesTabBar from "$lib/components/split-panes/PanesTabBar.svelte";
import SplitpanesTheme from "$lib/components/split-panes/SplitpanesTheme.svelte";
import { Splitpanes } from "svelte-splitpanes";
import type { DefinitionDashPaneProps } from "./types";

export let panes: DefinitionDashPaneProps[];
export let columnMode = false;
export let showTabBar: "never" | "for-closing" | "always" = "for-closing";
</script>

{#if showTabBar !== "never" && (showTabBar === "always" || panes.some(pane => pane.allowClosing))}
	<PanesTabBar bind:columnMode={columnMode} panes={panes}/>
{/if}
<Splitpanes theme="" horizontal={columnMode}>
	{#each panes as pane (pane.name)}
		{#if pane.shown}
			<DefinitionDashPane bind:props={pane}/>
		{/if}
	{/each}
</Splitpanes>
<SplitpanesTheme/>
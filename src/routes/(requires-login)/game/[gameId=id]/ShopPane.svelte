<script lang="ts">
import "$lib/styles/button.css";
import MinimizeButton from "$lib/components/split-panes/MinimizeButton.svelte";
import PaneTitle from "$lib/components/split-panes/PaneTitle.svelte";
import PaneTitleBar from "$lib/components/split-panes/PaneTitleBar.svelte";
import type { ShopItem } from "@prisma/client";
import type { Readable } from "svelte/store";

export let shopItems: ShopItem[];
export let currPoints: Readable<number>;
export let minimize: () => void;

async function buyItem(itemId: number) {
	const res = await fetch(`buy-item/${itemId}`);
	if (!res.ok) res.json().then((json) => alert(json.message));
}
</script>

<PaneTitleBar>
	<PaneTitle>Shop</PaneTitle>
	<MinimizeButton {minimize}/>
</PaneTitleBar>
<ul>
	{#each shopItems as item}
		<li>
			<h3>{item.name}</h3>
			<p class="description">{item.description || ""}</p>
			<p>Cost: <span>{item.cost}</span> point{item.cost === 1 ? "" : "s"}</p>
			<button
				type="button"
				on:click={() => buyItem(item.id)}
				disabled={item.cost > $currPoints}>Buy</button
			>
		</li>
	{/each}
</ul>

<style>
ul {
	flex-grow: 1;
	overflow-y: auto;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(20% - 1em)), 1fr));
	gap: 1em;
	padding: .5em;
	margin: 0;
}

li {
	list-style: none;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

h3 {
	margin: 0;
}

.description {
	flex-grow: 1;
	overflow-y: auto;
	margin: 0;
}
</style>

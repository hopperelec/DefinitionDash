<script lang="ts">
import MinimizeButton from "$lib/components/split-panes/MinimizeButton.svelte";
import PaneTitle from "$lib/components/split-panes/PaneTitle.svelte";
import PaneTitleBar from "$lib/components/split-panes/PaneTitleBar.svelte";

export let minimize: () => void;
</script>

<PaneTitleBar>
	<PaneTitle>Guide</PaneTitle>
	<MinimizeButton {minimize}/>
</PaneTitleBar>

<p>In Definition Dash, your goal is to end the game with the most points. Each room in the map contains a point for you to collect.</p>
<p>You can move to a room by clicking on it, but you cannot finish the move until you correctly answer a question. For each question, you are given the definition of a term and you must identify the term being defined. Each question has a number of different accepted answers and the answers are not case-sensitive, however you are expected to spell the answers correctly.</p>
<p>Once you move to a room, you will collect the point from that room and that point will now be claimed meaning it can't be claimed (by you or anyone else) again.</p>
<p>That is unless the room is unclaimed using items in the shop. The shop offers several items for you to spend your points on to help you win the game.</p>

<style>
p {
	text-align: center;
	padding: .5em;
	margin: 0;
	font-size: 1.1em;
}
</style>
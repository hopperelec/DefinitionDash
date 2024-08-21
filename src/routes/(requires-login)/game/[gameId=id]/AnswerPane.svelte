<script lang="ts">
import MinimizeButton from "$lib/components/split-panes/MinimizeButton.svelte";
import PaneTitle from "$lib/components/split-panes/PaneTitle.svelte";
import PaneTitleBar from "$lib/components/split-panes/PaneTitleBar.svelte";
import type { Definition } from "$lib/types";
import type { Writable } from "svelte/store";

export let currQuestion: Definition | null;
export let currMove: Writable<unknown>;
export let minimize: () => void;

let answer = "";
let usageElm: HTMLElement;
let status: undefined | "loading" | "incorrect";

currMove.subscribe(async (newMove) => {
	if (newMove && !currQuestion) {
		status = "loading";
		const res = await fetch(`question?svgRef=${newMove}`);
		const json = await res.json();
		if (res.ok) {
			status = undefined;
			currQuestion = json;
		} else {
			alert(json.message);
		}
	}
});

$: if (currQuestion?.usageTemplate && usageElm) {
	const emElement = document.createElement("em");
	emElement.textContent = answer;
	usageElm.innerHTML = currQuestion.usageTemplate.replaceAll(
		"{answer}",
		emElement.outerHTML,
	);
}

async function onKeyUp(event: KeyboardEvent) {
	if (event.key === "Enter") {
		status = "loading";
		const res = await fetch("answer", { method: "POST", body: answer });
		const json = await res.json();
		if (res.ok) {
			if (json.correct) {
				status = undefined;
				currMove.set(undefined);
				currQuestion = null;
				answer = "";
			} else {
				status = "incorrect";
			}
		} else {
			alert(json.message);
		}
	}
}

function focus(elm: HTMLElement) {
	elm.focus();
}
</script>

<PaneTitleBar>
	<PaneTitle>Answer</PaneTitle>
	<MinimizeButton {minimize}/>
</PaneTitleBar>
<div class:loading={status === "loading"} class:has-question={currQuestion} class:no-question={!currQuestion}>
	{#if currQuestion}
		<input
			bind:value={answer}
			class:shake={status === "incorrect"}
			disabled={status === "loading"}
			on:keyup={onKeyUp}
			placeholder="Type answer here..."
			type="text"
			use:focus
		/>
		{#if currQuestion.wordClass}
			<p id="word-class">{currQuestion.wordClass}</p>
		{/if}
		<p id="definition">{currQuestion.definition}</p>
		{#if currQuestion.usageTemplate}
			<p id="usage" bind:this={usageElm}>"{currQuestion.usageTemplate}"</p>
		{/if}
	{:else}
		<p>Click a nearby room on the map to get your next question</p>
	{/if}
</div>

<svelte:head>
	<style>
		#usage > em {
			width: 200px;
			border-bottom: 1px dashed darkgrey;
			height: 1em;
			font-weight: bold;
			vertical-align: text-top;

			/* Prevent overflow */
			display: inline-block;
			overflow-x: clip;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	</style>
</svelte:head>

<style lang="scss">
.has-question {
		padding: 1em;

	& > * {
		font-size: 3em;
		font-family: "Times New Roman", Times, serif;
	}
		
	& > p {
		margin: .1em 0;
	}
}

.no-question {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	text-align: center;
	padding: 1em 30%;
	box-sizing: border-box;
}

input {
	width: 100%;
	font-weight: bold;
}

#word-class,
#usage {
	font-style: italic;
}

#usage {
	color: darkgrey;
	font-size: 2em;
}

.loading {
	cursor: wait;

	& input {
		cursor: wait;
	}
}

.shake {
	animation: shake 0.15s 2;
}
@keyframes shake {
	25% {
		transform: translateX(.25em);
	}

	75% {
		transform: translateX(-.25em);
	}

	100% {
		transform: translateX(0);
	}
}
</style>

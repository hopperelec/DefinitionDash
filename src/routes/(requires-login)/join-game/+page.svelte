<script lang="ts">
import { goto } from "$app/navigation";
import DefaultLayout from "$lib/components/DefaultLayout.svelte";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";
import "$lib/styles/button.css";

title.set("Join game");

export let data: PageData;

let value = "";
const invalidInputRegex = new RegExp(/(^0+)|\D/g);
function onInput(event: Event & { currentTarget: HTMLInputElement }) {
	value = event.currentTarget.value = event.currentTarget.value.replaceAll(
		invalidInputRegex,
		"",
	);
}

async function joinGame() {
	await goto(`/game/${value}/`);
	// Ideally, errors would be handled before the redirect occurs
	// https://github.com/sveltejs/kit/issues/12399
}
</script>

<DefaultLayout isLoggedIn={!!data.userId} centerContent={true}>
	<div>
		<input type="text" placeholder="Game ID..." size={6} on:input={onInput}/>
		<button type="button" on:click={joinGame} disabled={!value}>Join game</button>
	</div>
</DefaultLayout>

<style>
div {
	display: flex;
	align-items: center;

	@media (aspect-ratio < 1) {
		flex-direction: column;
	}
}

input, button {
	font-size: 2em;
	margin: 0.5em;
	padding: 0.2em;
}
</style>
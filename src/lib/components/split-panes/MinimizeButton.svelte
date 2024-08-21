<script lang="ts">
export let minimize: () => void;
</script>

<button type="button" on:click={minimize}>
	<div>&#9473;</div>
</button>

<style>
div {
	font-weight: bold;
	padding: .1em;
	border-radius: 25%;
	aspect-ratio: 1 / 1;
	line-height: 1em;
}

button {
	margin-left: auto;
	font-size: inherit;
	background: none;
	border: none;
	padding: .15em;
	cursor: pointer;

	&:hover > div {
		background-color: #fff;
	}
}
</style>

<script context="module">
let globalInserted = false;
</script>

<script>
const localInsert = !globalInserted;
globalInserted = true;
</script>

<svelte:head>
	{#if localInsert}
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
	{/if}
</svelte:head>
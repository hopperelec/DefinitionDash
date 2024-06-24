<script>
import { page } from "$app/stores";
import DefaultLayout from "$lib/components/DefaultLayout.svelte";
import { title } from "$lib/page-meta";

title.set(`Error ${$page.status}`);
</script>

<DefaultLayout>
	<div>
		<h1>An error has occurred!</h1>
		<h2>{$page.status}: {$page.error?.message}</h2>
	</div>
</DefaultLayout>

<style>
div {
	flex: 1;
	text-align: center;
	display: flex;
	justify-content: center;
	flex-direction: column;
}

h1 {
	font-size: 64px;
	font-weight: bold;
}
</style>

<script lang="ts">
import { page } from "$app/stores";
import DefaultLayout from "$lib/components/DefaultLayout.svelte";
import { title } from "$lib/page-meta";
import type { LayoutData } from "./$types";

title.set(`Error ${$page.status}`);

export let data: LayoutData;
</script>

<DefaultLayout isLoggedIn={!!data.userId} centerContent={true}>
	<h1>An error has occurred!</h1>
	<h2>{$page.status}: {$page.error?.message}</h2>
</DefaultLayout>

<style>
h1 {
	font-size: 64px;
	font-weight: bold;
}
</style>

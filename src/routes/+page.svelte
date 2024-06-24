<script lang="ts">
import DefaultLayout from "$lib/components/DefaultLayout.svelte";
import { title } from "$lib/page-meta";
import type { PageData } from "./$types";

title.set(undefined);

export let data: PageData;
</script>

<DefaultLayout isLoggedIn={!!data.userId}>
	Home page placeholder
</DefaultLayout>

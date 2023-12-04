<script lang="ts">
  import type { LayoutData } from "./$types";
  import LogoutButton from "$lib/LogoutButton.svelte";

  export let data: LayoutData;
</script>

<p>You are currently logged in as {data.user.name}</p>
<LogoutButton />

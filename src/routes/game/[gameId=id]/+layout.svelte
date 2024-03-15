<script lang="ts">
  import { getChannel } from "$lib/ably-client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  const announcements = getChannel(
    "game:" + $page.params.gameId + ":announcements",
  );
  $: if ($announcements?.name == "end") {
    goto("/game/" + $page.params.gameId + "/end/");
  }
</script>

<slot />

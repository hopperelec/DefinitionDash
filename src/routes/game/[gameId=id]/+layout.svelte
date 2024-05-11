<script lang="ts">
  import { getChannel } from "$lib/ably-client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  export let data;

  // Listen for realtime announcements which need to be received on every page
  const announcement = getChannel(
    "game:" + $page.params.gameId + ":announcements",
  );
  $: if ($announcement) {
    /* eslint-disable no-fallthrough */
    switch ($announcement.name) {
      case "end":
        goto("/game/" + $page.params.gameId + "/end/");
      case "kick":
        if ($announcement.data.userId == data.userId) {
          alert("You've been kicked from this game!");
          goto("/");
        }
    }
    /* eslint-enable no-fallthrough */
  }
</script>

<slot />

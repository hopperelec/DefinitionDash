<script lang="ts">
  import ablyClientStore from "$lib/ably-client";
  import ably from "ably";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  onMount(async () => {
    const ablyClient = new ably.Realtime.Promise({ authUrl: "/ably-auth" });
    ablyClientStore.set(ablyClient);
    await ablyClient.channels
      .get("game:" + $page.params.gameId + ":announcements")
      .subscribe((message) => {
        switch (message.name) {
          case "end":
            goto("/game/" + $page.params.gameId + "/end/");
            break;
        }
      });
  });
</script>

<slot />

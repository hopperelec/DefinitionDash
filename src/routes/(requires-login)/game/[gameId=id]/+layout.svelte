<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { getChannel } from "$lib/ably-client";
import { setTitlePrefix } from "$lib/page-meta";
import type { PageData } from "./$types";

setTitlePrefix(`Game ${$page.params.gameId}`);

export let data: PageData;

const realtimeMessage = getChannel(`game:${$page.params.gameId}`);
$: if ($realtimeMessage) {
	switch ($realtimeMessage.name) {
		case "end":
			goto(`/game/${$page.params.gameId}/end/`);
			break;
		case "kick":
			if ($realtimeMessage.data.userId === data.userId) {
				alert("You've been kicked from this game!");
				goto("/");
			}
	}
}
</script>

<slot />

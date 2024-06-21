<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { getChannel } from "$lib/ably-client";
import type { PageData } from "./$types";

export let data: PageData;

const announcement = getChannel(`game:${$page.params.gameId}:announcements`);
$: if ($announcement) {
	switch ($announcement.name) {
		// biome-ignore lint/suspicious/noFallthroughSwitchClause:
		case "end":
			goto(`/game/${$page.params.gameId}/end/`);
		case "kick":
			if ($announcement.data.userId === data.userId) {
				alert("You've been kicked from this game!");
				goto("/");
			}
	}
}
</script>

<slot />

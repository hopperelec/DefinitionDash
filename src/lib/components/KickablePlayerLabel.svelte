<script lang="ts">
  import PlayerLabel from "$lib/components/PlayerLabel.svelte";
  import type { PlayerLabelProps } from "$lib/types";

  export let currentUserId: number;
  export let allowKicking = false;
  export let player: PlayerLabelProps;

  async function kickPlayer(userId: number) {
    const res = await fetch("../kick/" + userId + "/", { method: "POST" });
    if (!res.ok) alert((await res.json()).message);
  }
</script>

{#if allowKicking && player.id !== currentUserId && !player.isHost}
  <button
    on:click={async () => await kickPlayer(player.id)}
    tabindex="0"
    type="button"
  >
    <PlayerLabel {player} {currentUserId} />
  </button>
{:else}
  <PlayerLabel {player} {currentUserId} />
{/if}

<style>
  button {
    border: 0;
    padding: 0;
    background: none;
    position: relative;
    font: inherit;

    &:hover {
      cursor: pointer;

      /* Strikethrough, including icons */
      &::after {
        content: "";
        position: absolute;
        width: calc(100% + 10px);
        top: 50%;
        left: -5px;
        border-top: 2px solid black;
      }
    }
  }
</style>

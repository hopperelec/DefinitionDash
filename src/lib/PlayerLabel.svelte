<script lang="ts">
  import type { PlayerLabelProps } from "$lib/types";
  import { DEFAULT_USER_ICON } from "$lib/constants";

  export let currentUserId: number;
  export let player: PlayerLabelProps;
  let name = player.name || "User " + player.id;
</script>

<div
  class:current-user={player.id === currentUserId}
  class:host={player.isHost}
  id="label-container"
>
  <img
    alt="{name}'s picture"
    height="32"
    src={player.picture || DEFAULT_USER_ICON}
    width="32"
  />
  <span>{name}</span>
  {#if player.points}<span> - </span><span>{player.points} points</span>{/if}
</div>

<style>
  #label-container {
    display: inline-flex;
    vertical-align: middle;
    align-items: center;
    font-size: 24px;

    & > img {
      clip-path: inset(0% round 50%);
    }

    & > span {
      margin-left: 10px;
      margin-right: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .host {
    color: orange;
  }

  .current-user {
    color: blue;
  }
</style>
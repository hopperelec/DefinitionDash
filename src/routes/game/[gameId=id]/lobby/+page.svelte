<script lang="ts">
  import PlayerPicturePreloader from "$lib/PlayerPicturePreloader.svelte";
  import getDisplayName from "$lib/get-display-name";
  import { DEFAULT_USER_ICON } from "$lib/constants";
  import "$lib/button.css";
  import { getChannel } from "$lib/ably-client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  export let data;

  let players = data.players.reduce(
    (acc, player) => {
      acc[player.id] = {
        name: getDisplayName(player),
        picture: player.picture || DEFAULT_USER_ICON,
        isHost: player.isHost,
      };
      return acc;
    },
    {} as {
      [key: number]: { name: string; picture: string | null; isHost: boolean };
    },
  );
  let isHost = players[data.userId].isHost;

  const lobbyMessage = getChannel("game:" + $page.params.gameId + ":lobby");
  $: if ($lobbyMessage) {
    switch ($lobbyMessage.name) {
      case "start":
        goto("../");
        break;
      case "join":
        players[$lobbyMessage.data.id] = {
          name: $lobbyMessage.data.name,
          picture: $lobbyMessage.data.picture || DEFAULT_USER_ICON,
          isHost: false,
        };
        break;
      case "leave":
        delete players[$lobbyMessage.data.userId];
        players = players; // Trigger reactivity
        break;
      case "host":
        const userId = $lobbyMessage.data.userId;
        players[userId].isHost = true;
        if (userId == data.userId) {
          isHost = true;
          alert("The previous host left the game, so you have been assigned as the new host!");
        }
    }
  }

  function isOnlyHost() {
    return Object.entries(players).some(
      ([id, player]) => player.isHost && +id != data.userId,
    );
  }

  function leaveGame() {
    if (
      !isHost ||
      Object.keys(players).length == 1 ||
      confirm(
        (isOnlyHost()
          ? "You are the only host in this game. If you leave, a random player will be made the new host"
          : "You are currently a host of this game. If you leave, even if you rejoin, you will no longer be a host") +
          ". Are you sure you want to leave?",
      )
    )
      goto("leave");
  }
</script>

<div id="page-container">
  <div id="lobby-container">
    <h2>Lobby</h2>
    <div>
      {#if isHost}<a href="start" class="button">Start game</a>{/if}
      <button class="button" on:click={leaveGame} type="button">
        Leave game
      </button>
    </div>
    <ul>
      {#each Object.entries(players) as [id, player]}
        <li class:host={player.isHost} class:current-user={data.userId === +id}>
          <img
            width="32"
            height="32"
            src={player.picture}
            alt="{player.name}'s picture"
          />
          <span>{player.name}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<PlayerPicturePreloader players={data.players} />

<style>
  #page-container {
    height: 100vh;
    font-family: var(--default-font-family);
  }

  #page-container,
  #lobby-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #lobby-container {
    width: 100%;

    @media (width >= 1060px) {
      width: 1060px;
    }
  }

  h2 {
    font-size: 2em;
    margin: 0;
    font-family: var(--default-font-family-bold);
  }

  ul {
    padding: 0;
    margin: 0 10px;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  li {
    list-style-type: none;
    padding: 5px 0;
    position: relative;
    display: flex;
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

<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import "$lib/button.css";
  import decodeDoors from "$lib/decode-doors";
  import { onMount } from "svelte";
  import ably from "ably";

  type ClientPlayerData = {
    currRoomId: number,
    picture: string | null,
  };

  export let data;
  let map: SVGMap;
  let doors: { [key: number]: number[] };

  onMount(async () => {
      await new ably.Realtime.Promise({ authUrl: "/ably-auth" })
        .channels.get("game:" + data.player.gameId)
        .subscribe((message) => {
          console.log(message);
        })
    }
  );

  const players = data.players.reduce((acc, player) => {
    acc[player.user.id] = {
      currRoomId: player.currRoomId,
      picture: player.user.picture,
    };
    return acc;
  }, {} as { [ key: number ]: ClientPlayerData });
  const uniquePictures = data.players.reduce((acc, player) => {
    acc.add(player.user.picture);
    return acc
  }, new Set<string | null>);

  function movePlayerIcon(playerId: number) {
    const prevIcon = map.getElmWhere("player", playerId) as SVGImageElement;
    if (prevIcon) map.removeIcon(prevIcon);
    const player = players[playerId];
    const newIcon = map.addIconTo(
      player.currRoomId,
      player.picture || "/default_pfp.svg"
    );
    if (newIcon) {
      newIcon.dataset.player = playerId.toString();
    }
  }

  function canMoveTo(room: number) {
    const room1Id = Math.min(data.player.currRoomId, room);
    const room2Id = Math.max(data.player.currRoomId, room);
    return doors[room1Id] && doors[room1Id].includes(room2Id);
  }

  function addPtsChangeGlyph(amount: number) {
    const ptsIndicator = document.getElementById("pts-indicator");
    if (!ptsIndicator) return;
    const ptsChangeContainer = document.getElementById("pts-change-container");
    if (!ptsChangeContainer) return;
    const elm = ptsChangeContainer.appendChild(document.createElement("span"));
    if (amount > 0) {
      elm.innerText = "+" + amount;
      elm.style.color = "green";
    } else {
      elm.innerText = amount.toString();
      elm.style.color = "red";
    }
    elm.classList.add("pts-change");
    const rect = ptsIndicator.getBoundingClientRect();
    elm.style.left = `${rect.x + Math.floor(Math.random() * rect.width)}px`;
    setTimeout(() => elm.remove(), 1000);
  }

  function claimRoom(roomId: number) {
    players[data.player.userId].currRoomId = roomId
    data.player.currRoomId = roomId;
    data.player.points += 1;
    movePlayerIcon(data.player.userId);
    addPtsChangeGlyph(1);
  }

  async function askQuestion(question: string): Promise<boolean> {
    const res = await fetch("answer", {
      method: "POST",
      body: prompt(question),
    });
    return (await res.json()).correct;
  }

  async function getNextQuestion(
    roomToMoveTo: number,
  ): Promise<string | undefined> {
    const res = await fetch("get-definition?room=" + roomToMoveTo);
    if (res.ok)
      return "What vocabulary is being defined: " + (await res.text());
  }

  async function onClickRoom(clickedRoom: number) {
    if (canMoveTo(clickedRoom)) {
      const question = await getNextQuestion(clickedRoom);
      if (question) {
        let askAgain = true;
        while (askAgain) {
          if (await askQuestion(question)) askAgain = false;
        }
        claimRoom(clickedRoom);
      } else {
        alert(
          "An unexpected error occurred while trying to choose a question for you.",
        );
      }
    }
  }

  async function onMapSuccess() {
    for (const player of data.players) {
      movePlayerIcon(player.user.id);
    }
    doors = await fetch("/maps/" + data.mapId + "/doors")
      .then((response) => response.arrayBuffer())
      .then(decodeDoors);
    map.getSVG().addEventListener("mousemove", (event) => {
      const hoveredRoom = map.getEventRoom(event);
      map.getSVG().style.cursor = hoveredRoom
        ? canMoveTo(hoveredRoom)
          ? "pointer"
          : "not-allowed"
        : "";
    });
  }
</script>

<a class="button" href="shop">Shop</a>
<p id="pts-indicator">Points: <span>{data.player.points}</span></p>
<div id="pts-change-container"></div>
<SVGMap
  bind:this={map}
  imgURL={data.mapURL}
  {onClickRoom}
  onSuccess={onMapSuccess}
/>

<svelte:head>
  <link
    as="fetch"
    crossorigin="anonymous"
    href="/maps/{data.mapId}/doors"
    rel="preload"
  />
  {#each uniquePictures as picture}
    <link as="image" href="{picture || '/default_pfp.svg'}" rel="preload">
  {/each}
  <style>
    [data-player] {
      clip-path: inset(0% round 50%);
    }

    #pts-change-container > * {
      position: absolute;
      font-size: 18px;
      animation: fly-up-and-fade-out 1s ease-out forwards;
    }

    @keyframes fly-up-and-fade-out {
      100% {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
  </style>
</svelte:head>

<style>
  p {
    font-family: var(--default-font-family-bold);
    font-size: 2em;
    display: inline;
  }
</style>

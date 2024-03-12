<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import "$lib/button.css";
  import decodeDoors from "$lib/decode-doors";
  import { page } from "$app/stores";
  import ablyClientStore from "$lib/ably-client";
  import { DEFAULT_USER_ICON } from "$lib/constants";

  export let data;
  let map: SVGMap;
  let ptsIndicator: HTMLElement;
  let ptsChangeContainer: HTMLElement;
  let doors: { [key: number]: number[] };

  ablyClientStore.subscribe(async (ablyClient) => {
    if (!ablyClient) return;
    await ablyClient.channels
      .get("game:" + $page.params.gameId + ":positions")
      .subscribe((message) => {
        switch (message.name) {
          case "move":
            movePlayer(message.data.userId, message.data.svgRef);
            break;
        }
      });
    await ablyClient.channels
      .get("player:" + $page.params.gameId + ":" + data.userId)
      .subscribe((message) => {
        switch (message.name) {
          case "points":
            addPtsChangeGlyph(message.data.points - data.currPoints);
            data.currPoints = message.data.points;
            break;
        }
      });
  });

  function movePlayer(userId: number, svgRef: number) {
    data.players[userId].currSvgRef = svgRef;
    const prevIcon = map.getElmWhere("user", userId) as SVGImageElement;
    if (prevIcon) map.removeIcon(prevIcon);
    const player = data.players[userId];
    const newIcon = map.addIconTo(
      player.currSvgRef,
      player.picture || DEFAULT_USER_ICON,
    );
    if (newIcon) {
      newIcon.dataset.user = userId.toString();
    }
  }

  function canMoveTo(svgRef: number) {
    const svgRef1 = Math.min(data.players[data.userId].currSvgRef, svgRef);
    const svgRef2 = Math.max(data.players[data.userId].currSvgRef, svgRef);
    return doors[svgRef1] && doors[svgRef1].includes(svgRef2);
  }

  function addPtsChangeGlyph(amount: number) {
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

  async function askQuestion(question: string): Promise<boolean> {
    const res = await fetch("answer", {
      method: "POST",
      body: prompt(question),
    });
    return (await res.json()).correct;
  }

  async function getNextQuestion(
    svgRefToMoveTo: number,
  ): Promise<string | undefined> {
    const res = await fetch("get-definition?svgRef=" + svgRefToMoveTo);
    if (res.ok)
      return "What vocabulary is being defined: " + (await res.text());
  }

  async function onClickRoom(clickedSvgRef: number) {
    if (canMoveTo(clickedSvgRef)) {
      const question = await getNextQuestion(clickedSvgRef);
      if (question) {
        let askAgain = true;
        while (askAgain) {
          if (await askQuestion(question)) askAgain = false;
        }
      } else {
        alert(
          "An unexpected error occurred while trying to choose a question for you.",
        );
      }
    }
  }

  async function onMapSuccess() {
    for (const [userId, player] of Object.entries(data.players)) {
      movePlayer(+userId, player.currSvgRef);
    }
    doors = await fetch("/maps/" + data.map.id + "/doors")
      .then((response) => response.arrayBuffer())
      .then(decodeDoors);
    map.getSVG().addEventListener("mousemove", (event) => {
      const hoveredSvgRef = map.getEventRoom(event);
      map.getSVG().style.cursor = hoveredSvgRef
        ? canMoveTo(hoveredSvgRef)
          ? "pointer"
          : "not-allowed"
        : "";
    });
  }
</script>

<div id="page-container">
  <div id="top">
    <div id="top-left">
      <a class="button" href="leaderboard"><span>Leader</span><span>board</span></a>
      <a class="button" href="shop">Shop</a>
      <p bind:this={ptsIndicator} id="pts-indicator">
        Points: <span>{data.currPoints}</span>
      </p>
      <div bind:this={ptsChangeContainer} id="pts-change-container"></div>
    </div>
    <div id="top-right">
      {#if data.isHost}<a class="button" href="end">End game</a>{/if}
    </div>
  </div>
  <div id="map-container">
    <SVGMap
      bind:this={map}
      imgURL={data.map.imgURL}
      {onClickRoom}
      onSuccess={onMapSuccess}
    />
  </div>
</div>

<svelte:head>
  <link
    as="fetch"
    crossorigin="anonymous"
    href="/maps/{data.map.id}/doors"
    rel="preload"
  />
  {#each new Set(Object.values(data.players).map((player) => player.picture)) as picture}
    <link as="image" href={picture || DEFAULT_USER_ICON} rel="preload" />
  {/each}
  <style>
    [data-room]:hover {
      filter: brightness(1.5);
    }

    [data-user] {
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
    margin: 0;
  }

  #page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  #map-container {
    height: 100%;
    overflow: auto;
  }

  #top {
    display: flex;
    align-items: start;
  }

  #top-left, #top-right {
    display: flex;
    align-items: center;
    flex-flow: wrap;
  }

  #top-left {
    margin-right: auto;
  }

  #top-right {
    justify-content: end;
  }
</style>

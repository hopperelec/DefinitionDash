<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import "$lib/button.css";
  import decodeDoors from "$lib/decode-doors";
  import { page } from "$app/stores";
  import ablyClientStore from "$lib/ably-client";

  export let data;
  let map: SVGMap;
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
      player.picture || "/default_pfp.svg",
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

  function claimRoom(svgRef: number) {
    data.currPoints += 1;
    movePlayer(data.userId, svgRef);
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
        claimRoom(clickedSvgRef);
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

<a class="button" href="shop">Shop</a>
<p id="pts-indicator">Points: <span>{data.currPoints}</span></p>
<div id="pts-change-container"></div>
{#if data.isHost}<a id="end" class="button" href="end">End game</a>{/if}
<SVGMap
  bind:this={map}
  imgURL={data.map.imgURL}
  {onClickRoom}
  onSuccess={onMapSuccess}
/>

<svelte:head>
  <link
    as="fetch"
    crossorigin="anonymous"
    href="/maps/{data.map.id}/doors"
    rel="preload"
  />
  {#each new Set(Object.values(data.players).map((player) => player.picture)) as picture}
    <link as="image" href={picture || "/default_pfp.svg"} rel="preload" />
  {/each}
  <style>
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
  }

  #end {
    position: fixed;
    top: 0;
    right: 0;
  }
</style>

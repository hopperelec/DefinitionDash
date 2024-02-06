<script lang="ts">
  import SVGMap from "$lib/SVGMap.svelte";
  import "$lib/button.css";

  export let data;
  let map: SVGMap;
  let position: number | undefined;
  let points = data.player.points;

  const doors = data.map.doors.reduce(
    (acc: { [key: number]: number[] }, door) => {
      acc[door.svgRef1] = acc[door.svgRef1] || [];
      acc[door.svgRef1].push(door.svgRef2);
      return acc;
    },
    {},
  );

  function movePlayerIcon(
    playerId: number,
    playerPicture: string | null,
    roomId: number,
  ) {
    const prevIcon = map.getElmWhere("player", playerId) as SVGImageElement;
    if (prevIcon) map.removeIcon(prevIcon);
    const newIcon = map.addIconTo(roomId, playerPicture || "/default_pfp.svg");
    if (newIcon) {
      newIcon.dataset.player = playerId.toString();
    }
  }

  function canMoveTo(room: number) {
    if (!position) return false;
    const room1Id = Math.min(position, room);
    const room2Id = Math.max(position, room);
    return doors[room1Id] && doors[room1Id].includes(room2Id);
  }

  function addPointsChangeGlyph(amount: number) {
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
    elm.classList.add("points-change");
    const rect = ptsIndicator.getBoundingClientRect();
    elm.style.left = `${rect.x + Math.floor(Math.random() * rect.width)}px`;
    setTimeout(() => elm.remove(), 1000);
  }

  function claimRoom(roomId: number) {
    position = roomId;
    points += 1;
    addPointsChangeGlyph(1);
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
          "An unexpected error occured while trying to choose a question for you.",
        );
      }
    }
  }

  function onSuccess() {
    position = data.player.currRoomId;
    map.getSVG().addEventListener("mousemove", (event) => {
      const hoveredRoom = map.getEventRoom(event);
      map.getSVG().style.cursor = hoveredRoom
        ? canMoveTo(hoveredRoom)
          ? "pointer"
          : "not-allowed"
        : "";
    });
  }

  $: if (position !== undefined) {
    movePlayerIcon(data.player.id, data.picture, position);
  }
</script>

<a class="button" href="shop">Shop</a>
<p id="pts-indicator">Points: <span>{points}</span></p>
<div id="pts-change-container"></div>
<SVGMap bind:this={map} imgURL={data.map.imgURL} {onClickRoom} {onSuccess} />

<svelte:head>
  <style>
    [data-player] {
      clip-path: inset(0% round 50%);
    }

    #points-change-container > * {
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

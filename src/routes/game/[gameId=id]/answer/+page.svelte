<script lang="ts">
  import { goto } from "$app/navigation";

  export let data;
  let answer: string = "";
  let usageElm: HTMLElement;
  let status: undefined | "waiting" | "incorrect";

  $: if (usageElm) {
    const emElement = document.createElement("em");
    emElement.textContent = answer;
    usageElm.innerHTML = data.usageTemplate.replaceAll(
      "{answer}",
      emElement.outerHTML,
    );
  }

  async function onKeyUp(event: KeyboardEvent) {
    if (event.key == "Enter") {
      status = "waiting";
      const res = await fetch("", { method: "POST", body: answer });
      const json = await res.json();
      if (res.ok) {
        if (json.correct) {
          await goto("../");
        } else {
          status = "incorrect";
        }
      } else {
        alert(json.message);
      }
    }
  }
</script>

<div class:waiting={status === "waiting"} id="page-container">
  <div id="definition-container">
    <input
      bind:value={answer}
      class:shake={status === "incorrect"}
      disabled={status === "waiting"}
      on:keyup={onKeyUp}
      placeholder="Your answer..."
      type="text"
    />
    {#if data.wordClass}<p id="word-class">{data.wordClass}</p>{/if}
    <p id="definition">{data.definition}</p>
    {#if data.usageTemplate}<p id="usage" bind:this={usageElm}>
        "{data.usageTemplate}"
      </p>{/if}
  </div>
</div>

<svelte:head>
  <style>
    em {
      width: 200px;
      border-bottom: 1px dashed darkgrey;
      height: 1em;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      vertical-align: text-top;
      white-space: nowrap;
    }
  </style>
</svelte:head>

<style lang="scss">
  #page-container {
    display: flex;
    height: 100vh;
    align-items: center;
    justify-content: center;
  }

  #definition-container {
    @media (width >= 700px) {
      border: 1px solid black;
      padding: 10px;
      width: 600px;
    }

    & > * {
      font-size: 3em;
      font-family: "Times New Roman", Times, serif;
    }
  }

  p {
    margin: 5px 0;
  }

  input {
    width: calc(100% - 10px);
    font-weight: bold;
  }

  #word-class,
  #usage {
    font-style: italic;
  }

  #usage {
    color: darkgrey;
    font-size: 2em;
  }

  .waiting {
    cursor: wait;

    & input {
      cursor: wait;
    }
  }

  .shake {
    animation: shake 0.15s 2;
  }
  @keyframes shake {
    25% {
      transform: translateX(5px);
    }

    75% {
      transform: translateX(-5px);
    }

    100% {
      transform: translateX(0);
    }
  }
</style>

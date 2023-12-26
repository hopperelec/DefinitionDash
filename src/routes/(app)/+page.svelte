<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  export let data: PageData;
  onMount(() => {
    if (data.map) {
      const map_container = document.getElementById("map-container");
      if (map_container) {
        map_container.append(new DOMParser().parseFromString(data.map, "image/svg+xml").documentElement);
      }
    }
  });
</script>

<div id="map-container"></div>

<svelte:head>
  <style>
      body {
          margin: 0;
      }

      #map-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
      }

      [data-room]:hover {
          filter: brightness(1.5);
          cursor: pointer;
      }

      text {
          pointer-events: none;
      }
  </style>
</svelte:head>

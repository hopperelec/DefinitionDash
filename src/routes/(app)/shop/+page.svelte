<script lang="ts">
  import "$lib/button.css";
  import type { PageData } from "./$types";

  export let data: PageData;
  type ShopItem = {
    name: string;
    description?: string;
    cost: number;
  };

  const items: ShopItem[] = [
    {
      name: "Example first item",
      description: "Example first description",
      cost: 10,
    },
    {
      name: "Example item without a description",
      cost: 5,
    },
    {
      name: "Example item with long description",
      description:
        "This is an overly long description designed to test the overflow handling of the CSS on Definition Dash's shop page. This text should not break out of it's container but instead cause the container to display a scrollbar to scroll through the text.",
      cost: 999,
    },
  ];
  for (let i = 4; i <= 30; i++) {
    items.push({
      name: "Example item " + i,
      description:
        "This is just a filler item to see how well this shop scales with more items",
      cost: 1,
    });
  }
</script>

<div id="shop-container">
  <h2>Shop</h2>
  <p id="points">Points: <span>{data.player.points}</span></p>
  <ul>
    {#each items as item}
      <li>
        <h3>{item.name}</h3>
        <p class="description">{item.description || ""}</p>
        <p>Cost: <span>{item.cost}</span> point{item.cost === 1 ? "" : "s"}</p>
        <button type="button">Buy</button>
      </li>
    {/each}
  </ul>
  <a class="button" href="/">Back to game</a>
</div>

<style>
  #shop-container {
    font-family: Arial, Gadget, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    margin: 0 20px;
  }

  h2 {
    font-size: 2em;
    font-family: "Arial Black", "Arial Bold", "Helvetica Neue", Helvetica,
      Gadget, sans-serif;
    margin: 0;
  }

  #points {
    font-size: 1.5em;
    margin: 0;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(max(200px, calc(20% - 20px)), 1fr)
    );
    grid-template-rows: repeat(auto-fill, minmax(150px, 1fr));
    grid-gap: 5% 20px;
    width: 100%;
    flex-grow: 1;
    padding: 0;
    overflow-y: auto;
  }

  li {
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .description {
    flex-grow: 1;
    overflow-y: auto;
    margin: 0;
  }

  h3 {
    margin: 0;
  }
</style>

<script lang="ts">
  import "$lib/button.css";

  export let data;

  async function buyItem(itemId: number) {
    const res = await fetch(`${itemId}/buy`);
    const json = await res.json();
    if (res.ok) {
      data.player = json;
    } else {
      alert(json.message);
    }
  }
</script>

<div id="shop-container">
  <h2>Shop</h2>
  <p id="points">Points: <span>{data.player.points}</span></p>
  <ul>
    {#each data.shopItems as item}
      <li>
        <h3>{item.name}</h3>
        <p class="description">{item.description || ""}</p>
        <p>Cost: <span>{item.cost}</span> point{item.cost === 1 ? "" : "s"}</p>
        <button
          type="button"
          on:click={() => buyItem(item.id)}
          disabled={item.cost > data.player.points}>Buy</button
        >
      </li>
    {/each}
  </ul>
  <a class="button" href="../">Back to game</a>
</div>

<style>
  #shop-container {
    font-family: var(--default-font-family);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    margin: 0 20px;
  }

  h2 {
    font-size: 2em;
    font-family: var(--default-font-family-bold);
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

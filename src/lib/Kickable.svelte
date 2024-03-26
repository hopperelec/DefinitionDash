<script lang="ts">
  export let userId: number;

  async function kickPlayer(userId: number) {
    const res = await fetch("../kick/" + userId + "/", { method: "POST" });
    if (!res.ok) alert((await res.json()).message);
  }
</script>

<button
  on:click={async () => await kickPlayer(userId)}
  tabindex="0"
  type="button"
>
  <slot/>
</button>

<style>
  button {
    border: 0;
    padding: 0;
    background: none;
    position: relative;
    font: inherit;

    &:hover {
      cursor: pointer;

      /* Strikethrough, including icons */
      &::after {
        content: "";
        position: absolute;
        width: calc(100% + 10px);
        top: 50%;
        left: -5px;
        border-top: 2px solid black;
      }
    }
  }
</style>

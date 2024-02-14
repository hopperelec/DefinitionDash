<script>
  import { onMount } from "svelte";

  onMount(() => {
    const events = new EventSource('../events');
    events.addEventListener("connect", event => {
      console.log("New connection from "+event.data);
    });
  });
</script>

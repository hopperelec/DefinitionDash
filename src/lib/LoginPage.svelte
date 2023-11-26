<script>
  import { PUBLIC_GOOGLE_CLIENT_ID, PUBLIC_BASE_URL } from "$env/static/public";
</script>

<svelte:head>
  <script src="https://accounts.google.com/gsi/client" async></script>
</svelte:head>

<div
  id="g_id_onload"
  data-client_id={PUBLIC_GOOGLE_CLIENT_ID}
  data-context="signin"
  data-ux_mode="redirect"
  data-login_uri="{PUBLIC_BASE_URL}/callback"
  data-auto_prompt="false"
></div>

<main>
  <header>Definition Dash</header>
  <div
    class="g_id_signin"
    data-type="standard"
    data-shape="rectangular"
    data-theme="outline"
    data-text="continue_with"
    data-size="large"
    data-logo_alignment="left"
  >
    <!-- prettier-ignore -->
  </div>
</main>

<style>
  main {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: absolute;
    inset: 0;
    margin: auto;
    height: 80px;
  }

  header {
    text-align: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: bold;
    font-size: 40px;
  }
</style>

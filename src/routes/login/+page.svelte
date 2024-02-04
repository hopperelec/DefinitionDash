<script>
  import { PUBLIC_BASE_URL, PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
</script>

<svelte:head>
  <script async src="https://accounts.google.com/gsi/client"></script>
</svelte:head>

<div
  data-auto_prompt="false"
  data-client_id={PUBLIC_GOOGLE_CLIENT_ID}
  data-context="signin"
  data-login_uri="{PUBLIC_BASE_URL}/login/callback"
  data-ux_mode="redirect"
  id="g_id_onload"
></div>

<main>
  <header>Definition Dash</header>
  <div
    class="g_id_signin"
    data-logo_alignment="left"
    data-shape="rectangular"
    data-size="large"
    data-text="continue_with"
    data-theme="outline"
    data-type="standard"
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
    font-family: var(--default-font-family);
    font-weight: bold;
    font-size: 40px;
  }
</style>

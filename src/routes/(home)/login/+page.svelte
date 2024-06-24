<script>
import { page } from "$app/stores";
import { PUBLIC_BASE_URL, PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { title } from "$lib/page-meta";

title.set("Login");
$: redirectURI = $page.url.searchParams.get("redirect_uri");
</script>

<svelte:head>
	<script async src="https://accounts.google.com/gsi/client"></script>
</svelte:head>

<div
	data-auto_prompt="false"
	data-client_id={PUBLIC_GOOGLE_CLIENT_ID}
	data-context="signin"
	data-login_uri="{PUBLIC_BASE_URL}/login/callback{redirectURI ? `?redirect_uri=${redirectURI}` : ''}"
	data-ux_mode="redirect"
	id="g_id_onload"
></div>

<div id="login-container">
	<div
		class="g_id_signin"
		data-logo_alignment="left"
		data-shape="rectangular"
		data-size="large"
		data-text="continue_with"
		data-theme="outline"
		data-type="standard"
	>
	</div>
</div>

<style>
#login-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
}
</style>

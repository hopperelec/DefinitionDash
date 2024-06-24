<script>
import { page } from "$app/stores";
import DefinitionDashLogo from "$lib/media/logo.svg";
</script>

<div id="home-container">
	<header>
		<a href="/" id="logotype">
			<img src={DefinitionDashLogo} alt="Definition Dash logo"/>
			<h1>Definition<br>Dash</h1>
		</a>
		{#if $page.url.pathname !== "/login/"}
			<a href="/login/" id="login-button">Login</a>
		{/if}
	</header>
	<main><slot/></main>
	<footer>
		<a href="/terms">Terms of service</a>
		<a href="/privacy">Privacy policy</a>
	</footer>
</div>

<style>
#home-container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	font-size: max(14px, min(1.5vw, 1.5vh));
	font-family: var(--default-font-family);
}

header {
	--height: 4em;

	border-bottom: 2px solid black;
	height: var(--height);
}

#logotype {
	display: inline-flex;
	align-items: center;
}

img {
	max-height: var(--height);
	padding: .5em;
	box-sizing: border-box;
}

h1 {
	font-size: 1.5em;
	line-height: 1em;
	margin: 0;
}

a {
	color: inherit;
	text-decoration: none;
}

#login-button {
	height: 100%;
	padding: 0 .5em;
	float: right;
	font-size: 1.7em;
	display: flex;
	align-items: center;
}

main {
	flex-grow: 1;
	display: flex;
}

footer {
	border-top: 2px solid black;

	& > a {
		padding: 0 .5em;
		font-weight: bold;
		line-height: 2em;
	}
}
</style>
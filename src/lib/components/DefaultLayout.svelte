<script lang="ts">
import { page } from "$app/stores";
import DefinitionDashLogo from "$lib/media/logo.svg";

export let isLoggedIn: boolean;
export let centerContent = false;
</script>

<div id="home-container">
	<header>
		<a href="/" id="logotype">
			<img src={DefinitionDashLogo} alt="Definition Dash logo"/>
			<h1>Definition<br>Dash</h1>
		</a>
		<nav>
			{#if isLoggedIn}
				{#if $page.url.pathname !== "/join-game/"}
					<a href="/join-game/">Join game</a>
				{/if}
				<!--
					Causes a console error and doesn't use CSR
					https://github.com/sveltejs/kit/issues/12398
				-->
				<a href="/game">New game</a>
			{:else}
				{#if $page.url.pathname !== "/login/"}
					<a href="/login/">Login</a>
				{/if}
			{/if}
		</nav>
	</header>
	<main class:center={centerContent}><slot/></main>
	<footer>
		<a href="/terms">Terms of service</a>
		<span>-</span>
		<a href="/privacy">Privacy policy</a>
		<span>-</span>
		<a href="https://github.com/hopperelec/DefinitionDash">Source code</a>
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

nav {
	height: 100%;
	float: right;
	font-size: 1.7em;
	display: flex;
	align-items: center;

	& > a {
		padding: 0 .5em;
	}
}

main {
	flex-grow: 1;
	display: flex;

	&.center {
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
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
<script>
import DefinitionDashLogo from "$lib/media/logo.svg";
import "$lib/styles/status-bar.css";
</script>

<div class="status-bar">
	<img src={DefinitionDashLogo} alt="Definition Dash logo"/>
	<span>Definition Dash</span>
	<slot/>
</div>

<style>
img {
	height: 1em;
	padding-right: .5em;
}
</style>
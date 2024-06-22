<script>
import { BRAND_COLOR, SITE_NAME } from "$lib/constants";
import { description, setTitlePrefix, title } from "$lib/page-meta";

title.set(undefined);
setTitlePrefix(undefined);
</script>

<slot />

<svelte:head>
	<title>{$title}</title>
	<meta name="apple-mobile-web-app-title" content={SITE_NAME}>
	<meta name="application-name" content={SITE_NAME}>
	<meta name="description" content={$description}/>
	<meta property="og:description" content={$description}/>
	<meta property="og:type" content="website"/>
	<meta property="og:locale" content="en_GB"/>
	<meta name="msapplication-TileColor" content={BRAND_COLOR}/>
	<meta name="theme-color" content={BRAND_COLOR}/>
</svelte:head>

<style>
:global(body) {
	margin: 0;
	/* stylelint-disable value-keyword-case */
	--default-font-family: "Helvetica Neue", Helvetica, Gadget, sans-serif;
	--default-font-family-bold: "Arial Black", "Arial Bold", "Helvetica Neue",
		Helvetica, Gadget, sans-serif;
	/* stylelint-enable value-keyword-case */
}
</style>

import { SITE_DESCRIPTION, SITE_NAME } from "$lib/constants";
import { writable } from "svelte/store";

let defaultName = SITE_NAME;
let currentTitleValue: string | undefined;

const { subscribe, set } = writable(SITE_NAME);
function refreshTitle() {
	set(
		currentTitleValue ? `${defaultName} | ${currentTitleValue}` : defaultName,
	);
}
export const title = {
	subscribe,
	set: (value: string | undefined) => {
		currentTitleValue = value;
		refreshTitle();
	},
};

export function setTitlePrefix(prefix: string | undefined) {
	defaultName = prefix ? `${SITE_NAME} | ${prefix}` : SITE_NAME;
	refreshTitle();
}

export const description = writable(SITE_DESCRIPTION);

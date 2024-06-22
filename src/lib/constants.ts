import { PUBLIC_BASE_URL } from "$env/static/public";

export const SESSION_COOKIE_KEY = "session";
export const SESSION_DURATION_DAYS = 7;
export const ICON_SIZE = 16;
export const SVG_NS = "http://www.w3.org/2000/svg";

export const SITE_NAME = "Definition Dash";
export const SITE_DESCRIPTION = "Lorem ipsum"; // TODO
export const BASE_URL = PUBLIC_BASE_URL || "http://localhost:5173";
export const BRAND_COLOR = "#fff";

const insertableConstants = {
	SITE_NAME,
	SITE_DESCRIPTION,
	BASE_URL,
	BRAND_COLOR,
};

export function insertInto(text: string): string {
	for (const [key, value] of Object.entries(insertableConstants)) {
		text = text.replaceAll(`%${key}%`, value);
	}
	return text;
}

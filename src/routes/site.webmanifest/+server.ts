import { insertInto } from "$lib/constants";
import type { RequestHandler } from "@sveltejs/kit";
import manifest from "./site.webmanifest?raw";

export const GET: RequestHandler = async () => {
	return new Response(insertInto(manifest));
};

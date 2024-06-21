import type { Handle, RequestEvent } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import type { Options } from "html-minifier-terser";
import { minify } from "html-minifier-terser";
import prisma from "$lib/server/prisma";
import { toBuffer } from "uuid-buffer";
import { SESSION_COOKIE_KEY } from "$lib/constants";

const minificationOptions: Options = {
	collapseInlineTagWhitespace: true,
	collapseWhitespace: true,
	minifyJS: true,
	minifyCSS: true,
	noNewlinesBeforeTagClose: true,
	removeRedundantAttributes: true,
};

async function isAuthorized(event: RequestEvent): Promise<boolean> {
	if (event.url.pathname.startsWith("/login")) return true;
	const sessionUUID = event.cookies.get(SESSION_COOKIE_KEY);
	if (!sessionUUID) return false;
	const session = await prisma.session.findUnique({
		where: { uuidBin: toBuffer(sessionUUID) },
		select: { user: true, expires: true },
	});
	if (!session) error(400, "Invalid session UUID");
	if (new Date() > session.expires) return false;
	if (!session.user.allowed)
		error(
			403,
			"Currently, only accounts registered with my school are allowed to access Definition Dash",
		);
	event.locals.user = session.user;
	if (!event.url.pathname.startsWith("/teacher") || session.user.isTeacher)
		return true;
	error(403, "Only teachers can access this page!");
}

// Runs before every request
export const handle: Handle = async ({ event, resolve }) => {
	let page = "";

	if (await isAuthorized(event)) {
		// The user is signed in; return the requested page
		return resolve(event, {
			// Minify the page
			transformPageChunk: ({ html, done }) => {
				page += html;
				if (done) {
					return minify(page, minificationOptions);
				}
			},
		});
	}
	// The user isn't signed in; redirect them to the login page
	return new Response("Redirect", {
		status: 303,
		headers: { Location: "/login" },
	});
};

import { SESSION_COOKIE_KEY } from "$lib/constants";
import prisma from "$lib/server/prisma";
import { type Handle, type RequestEvent, redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { toBuffer } from "uuid-buffer";

function requiresAuthorization(event: RequestEvent) {
	return event.route.id?.startsWith("/(requires-login)");
}

async function isAuthorized(event: RequestEvent) {
	const sessionUUID = event.cookies.get(SESSION_COOKIE_KEY);
	if (!sessionUUID) return false;
	const session = await prisma.session.findUnique({
		where: { uuidBin: toBuffer(sessionUUID) },
		select: { user: true, expires: true },
	});
	if (!session) error(400, "Invalid session UUID");
	if (new Date() > session.expires) return false;
	event.locals.user = session.user;
	if (!requiresAuthorization(event)) return true;
	if (!session.user.allowed)
		error(
			403,
			"Currently, only accounts registered with my school are allowed to access Definition Dash",
		);
	if (event.url.pathname.startsWith("/teacher") && session.user.isTeacher)
		error(403, "Only teachers can access this page!");
	return true;
}

export const handle: Handle = async ({ event, resolve }) => {
	// Check if authorized first so that `event.locals.user` is set even if authorization isn't required
	if (await isAuthorized(event)) {
		return resolve(event);
	}
	return redirect(303, `/login/?redirect_uri=${event.url.pathname}`);
};

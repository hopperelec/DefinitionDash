import { SESSION_COOKIE_KEY } from "$lib/constants";
import prisma from "$lib/server/prisma";
import { type RequestHandler, redirect } from "@sveltejs/kit";
import { toBuffer } from "uuid-buffer";

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionUUID = cookies.get(SESSION_COOKIE_KEY);
	if (sessionUUID) {
		await prisma.session.update({
			data: { expires: new Date() },
			where: { uuidBin: toBuffer(sessionUUID) },
		});
		cookies.delete(SESSION_COOKIE_KEY, { path: "/" });
	}
	return redirect(303, "/");
};

import { SESSION_COOKIE_KEY } from "$lib/constants";
import prisma from "$lib/server/prisma";
import type { RequestHandler } from "@sveltejs/kit";
import encodeUUID from "$lib/encode-uuid";

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionUUID = cookies.get(SESSION_COOKIE_KEY);
  if (sessionUUID) {
    await prisma.session.update({
      data: { expires: new Date() },
      where: { uuidBin: encodeUUID(sessionUUID) },
    });
    cookies.delete(SESSION_COOKIE_KEY, { path: "/" });
  }
  return new Response("Redirect", {
    status: 303,
    headers: { Location: "/login" },
  });
};

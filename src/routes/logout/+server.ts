import { SESSION_COOKIE_KEY } from "$lib/constants";
import prisma from "$lib/server/prisma";
import { toBuffer } from "uuid-buffer";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const sessionUUID = cookies.get(SESSION_COOKIE_KEY);
  if (sessionUUID) {
    await prisma.session.update({
      data: {
        expires: new Date(),
      },
      where: {
        uuidBin: toBuffer(sessionUUID),
      },
    });
    cookies.delete(SESSION_COOKIE_KEY);
  }
  return new Response("Redirect", {
    status: 303,
    headers: { Location: "/login" },
  });
};

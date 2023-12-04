import { SESSION_COOKIE_KEY } from "$lib/constants";
import prisma from "$lib/prisma";
import { toBuffer } from "uuid-buffer";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  const session_uuid = cookies.get(SESSION_COOKIE_KEY);
  if (session_uuid) {
    await prisma.session.update({
      data: {
        expires: new Date(),
      },
      where: {
        uuid_bin: toBuffer(session_uuid),
      },
    });
    cookies.delete(SESSION_COOKIE_KEY);
  }
  return new Response("Redirect", {
    status: 303,
    headers: { Location: "/login" },
  });
};

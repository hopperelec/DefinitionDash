import type { RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { ALLOWED_DOMAIN } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { toBuffer } from "uuid-buffer";
import { dev } from "$app/environment";
import { SESSION_COOKIE_KEY, SESSION_DURATION_DAYS } from "$lib/constants";

export const POST: RequestHandler = async ({ request, cookies }) => {
  const params = new URLSearchParams(await request.text());

  const token = params.get("credential");
  if (!token) error(400, "No credential passed");
  const csrfCookie = params.get("g_csrf_token");
  if (!csrfCookie) error(400, "No CSRF token in Cookie.");
  const csrfBody = params.get("g_csrf_token");
  if (!csrfBody) error(400, "No CSRF token in post body.");
  if (csrfCookie != csrfBody) error(400, "Failed to verify CSRF token");

  const client = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: PUBLIC_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) error(400, "Failed to verify ID token");

  const domain = payload.hd || ALLOWED_DOMAIN;
  const user = await prisma.user.upsert({
    where: { googleSub: payload.sub },
    create: {
      school: {
        connectOrCreate: {
          where: { domain },
          create: { domain },
        },
      },
      googleSub: payload.sub,
      allowed: payload.hd === ALLOWED_DOMAIN,
      name: payload.name,
      picture: payload.picture,
    },
    update: { name: payload.name, picture: payload.picture },
    select: { id: true },
  });

  const sessionUUID: string = crypto.randomUUID();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_DURATION_DAYS);
  await prisma.session.create({
    data: { userId: user.id, uuidBin: toBuffer(sessionUUID), expires: expiry },
  });

  cookies.set(SESSION_COOKIE_KEY, sessionUUID, {
    path: "/",
    httpOnly: true,
    secure: !dev,
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
  });

  return new Response("Redirect", {
    status: 303,
    headers: { Location: "/" },
  });
};

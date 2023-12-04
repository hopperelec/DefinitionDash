import type { RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { ALLOWED_DOMAIN } from "$env/static/private";
import prisma from "$lib/prisma";
import type { School, User } from "@prisma/client";
import { toBuffer } from "uuid-buffer";
import { dev } from "$app/environment";

const SESSION_DURATION_DAYS = 7;

export const POST: RequestHandler = async ({ request, cookies }) => {
  const params = new URLSearchParams(await request.text());

  const token = params.get("credential");
  if (!token) throw error(400, "No credential passed");
  const csrf_cookie = params.get("g_csrf_token");
  if (!csrf_cookie) throw error(400, "No CSRF token in Cookie.");
  const csrf_body = params.get("g_csrf_token");
  if (!csrf_body) throw error(400, "No CSRF token in post body.");
  if (csrf_cookie != csrf_body) throw error(400, "Failed to verify CSRF token");

  const client = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: PUBLIC_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw error(400, "Failed to verify ID token");
  }

  let user: User | null = await prisma.user.findFirst({
    where: { google_sub: payload.sub },
  });
  if (!user) {
    const domain = payload.hd || ALLOWED_DOMAIN;
    let school: School | null = await prisma.school.findUnique({
      where: { domain },
    });
    if (!school) {
      school = await prisma.school.create({
        data: { domain },
      });
    }
    user = await prisma.user.create({
      data: {
        school_id: school.id,
        google_sub: payload.sub,
        allowed: payload.hd === ALLOWED_DOMAIN,
      },
    });
  }
  user = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: payload.name,
      picture: payload.picture,
    },
  });

  const session_uuid: string = crypto.randomUUID();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_DURATION_DAYS);
  await prisma.session.create({
    data: {
      user_id: user.id,
      uuid_bin: toBuffer(session_uuid),
      expires: expiry,
    },
  });

  cookies.set("session", session_uuid, {
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

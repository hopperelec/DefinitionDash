import type { RequestHandler } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
  const params = new URLSearchParams(await request.text());

  const token = params.get("credential");
  if (!token) throw error(403, "No credential passed");
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
  // const payload = ticket.getPayload();
  // payload?.hd

  return new Response("Authenticated!");
};

import type { Handle, RequestEvent } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import type { Options } from "html-minifier-terser";
import { minify } from "html-minifier-terser";
import prisma from "$lib/prisma";
import { toBuffer } from "uuid-buffer";
import { SESSION_COOKIE_KEY } from "$lib/constants";

const minification_options: Options = {
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  minifyJS: true,
  minifyCSS: true,
  noNewlinesBeforeTagClose: true,
  removeRedundantAttributes: true,
};

async function isAuthorized(event: RequestEvent): Promise<boolean> {
  if (event.url.pathname.startsWith("/login")) {
    return true;
  }
  const sessionUUID = event.cookies.get(SESSION_COOKIE_KEY);
  if (!sessionUUID) {
    return false;
  }
  const session = await prisma.session.findUnique({
    where: {
      uuid_bin: toBuffer(sessionUUID),
    },
    include: {
      user: true,
    },
  });
  if (!session) {
    throw error(400, "Invalid session UUID");
  }
  if (new Date() > session.expires) {
    return false;
  }
  if (session.user.allowed) {
    event.locals.user = session.user;
    return true;
  }

  throw error(
    403,
    "Currently, only accounts registered with my school are allowed to access Definition Dash",
  );
}

export const handle: Handle = async ({ event, resolve }) => {
  let page = "";

  if (await isAuthorized(event)) {
    return resolve(event, {
      transformPageChunk: ({ html, done }) => {
        page += html;
        if (done) {
          return minify(page, minification_options);
        }
      },
    });
  }
  return new Response("Redirect", {
    status: 303,
    headers: { Location: "/login" },
  });
};

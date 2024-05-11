import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import encodeDoors from "$lib/server/encode-doors";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = {
  // Don't re-encode doors for every request
  // Instead, cache the result server-side and re-use the result for 60 seconds
  // After 60 seconds, re-encode it in case the doors have been updated
  isr: {
    expiration: 60,
  },
};

export const GET = async ({ params, locals }) => {
  const map = await prisma.map.findFirst({
    where: {
      id: +params.mapId,
      creator: { schoolId: locals.user.schoolId },
    },
    select: {
      doors: { select: { svgRef1: true, svgRef2: true } },
    },
  });
  if (!map) error(403, "You do not have access to a game with this ID!");
  return new Response(encodeDoors(map.doors));
};

import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getMapFor } from "$lib/get-map-for";
import type { LocalDoor } from "$lib/types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const door: LocalDoor = await request.json();
  const mapId = (await getMapFor(locals.user))?.id;
  if (!mapId) throw error(403, "You do not have access to any maps!");
  await prisma.door.delete({
    where: {
      mapId,
      svgRef1Id: door.svgRef1Id,
      svgRef2Id: door.svgRef2Id,
    },
  });
  return new Response();
};

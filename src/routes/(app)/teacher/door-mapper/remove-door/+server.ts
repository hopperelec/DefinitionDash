import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import type { LocalDoor } from "$lib/types";
import getAnyMapFor from "$lib/get-any-map-for";

export const POST: RequestHandler = async ({ request, locals }) => {
  const door: LocalDoor = await request.json();
  const map = await getAnyMapFor(locals.user.schoolId);
  if (!map) throw error(403, "You do not have access to any maps!");
  await prisma.door.delete({
    where: {
      mapId_svgRef1Id_svgRef2Id: {
        mapId: map.id,
        svgRef1Id: door.svgRef1Id,
        svgRef2Id: door.svgRef2Id,
      },
    },
  });
  return new Response();
};

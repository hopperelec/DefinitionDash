import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getMapFor } from "$lib/get-map-for";
import type { LocalDoor } from "$lib/types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const mapId = (await getMapFor(locals.user))?.id;
  if (!mapId) throw error(403, "You do not have access to any maps!");
  const door: LocalDoor = await request.json();
  if (door.svgRef1Id === door.svgRef2Id)
    throw error(400, "Cannot add a door between a room and itself!");
  await prisma.door.create({
    data: {
      map: {
        connect: {
          id: mapId,
        },
      },
      svgRef1: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.min(door.svgRef1Id, door.svgRef2Id),
            mapId,
          },
        },
      },
      svgRef2: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.max(door.svgRef1Id, door.svgRef2Id),
            mapId,
          },
        },
      },
    },
  });
  return new Response();
};

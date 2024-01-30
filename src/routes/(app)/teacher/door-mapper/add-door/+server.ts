import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import type { LocalDoor } from "$lib/types";
import getAnyMapFor from "$lib/get-any-map-for";

export const POST: RequestHandler = async ({ request, locals }) => {
  const map = await getAnyMapFor(locals.user.schoolId);
  if (!map) throw error(403, "You do not have access to any maps!");
  const door: LocalDoor = await request.json();
  if (door.svgRef1Id === door.svgRef2Id)
    throw error(400, "Cannot add a door between a room and itself!");
  await prisma.door.create({
    data: {
      map: {
        connect: {
          id: map.id,
        },
      },
      svgRef1: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.min(door.svgRef1Id, door.svgRef2Id),
            mapId: map.id,
          },
        },
      },
      svgRef2: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.max(door.svgRef1Id, door.svgRef2Id),
            mapId: map.id,
          },
        },
      },
    },
  });
  return new Response();
};

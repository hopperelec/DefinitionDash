import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getMapFor } from "$lib/get-map-for";
import type { LocalDoor } from "$lib/types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const mapId = (await getMapFor(locals.user))?.id;
  if (!mapId) throw error(403, "You do not have access to any maps!");
  const door: LocalDoor = await request.json();
  if (door.room1Id === door.room2Id)
    throw error(400, "Cannot add a door between a room and itself!");
  await prisma.door.create({
    data: {
      map: {
        connect: {
          id: mapId,
        },
      },
      room1: {
        connect: {
          id_mapId: {
            id: Math.min(door.room1Id, door.room2Id),
            mapId,
          },
        },
      },
      room2: {
        connect: {
          id_mapId: {
            id: Math.max(door.room1Id, door.room2Id),
            mapId,
          },
        },
      },
    },
  });
  return new Response();
};

import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getMapFor } from "$lib/get-map-for";
import type { LocalDoor } from "$lib/types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const map_id = (await getMapFor(locals.user))?.id;
  if (!map_id) throw error(403, "You do not have access to any maps!");
  const door: LocalDoor = await request.json();
  if (door.room1_id === door.room2_id)
    throw error(400, "Cannot add a door between a room and itself!");
  await prisma.door.create({
    data: {
      map: {
        connect: {
          id: map_id,
        },
      },
      room1: {
        connect: {
          id_map_id: {
            id: Math.min(door.room1_id, door.room2_id),
            map_id,
          },
        },
      },
      room2: {
        connect: {
          id_map_id: {
            id: Math.max(door.room1_id, door.room2_id),
            map_id,
          },
        },
      },
    },
  });
  return new Response();
};

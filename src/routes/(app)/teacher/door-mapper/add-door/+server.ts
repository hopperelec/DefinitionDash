import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getMapFor } from "$lib/get-map-for";

export const POST: RequestHandler = async ({ request, locals }) => {
  const map_id = (await getMapFor(locals.user))?.id;
  if (!map_id) throw error(403, "You do not have access to any maps!");
  const params = await request.json();
  if (params.room1_id === params.room2_id)
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
            id: Math.min(params.room1_id, params.room2_id),
            map_id,
          },
        },
      },
      room2: {
        connect: {
          id_map_id: {
            id: Math.max(params.room1_id, params.room2_id),
            map_id,
          },
        },
      },
    },
  });
  return new Response();
};

import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import encodeDoors from "$lib/encode-doors";

export const GET = async ({ params, locals }) => {
  const map = await prisma.map.findFirst({
    where: {
      id: +params.mapId,
      creator: {
        schoolId: locals.user.schoolId,
      },
    },
    select: {
      doors: {
        select: {
          svgRef1: true,
          svgRef2: true,
        },
      },
    },
  });
  if (!map) throw error(403, "You do not have access to a game with this ID!");
  return new Response(encodeDoors(map.doors));
};

import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const map = await prisma.map.findUnique({
    where: {
      id: +params.mapId,
      creator: {
        schoolId: locals.user.schoolId,
      },
    },
    select: {
      doors: true,
      imgURL: true,
    },
  });
  if (map) return { map: map };
  throw error(403, "You do not have access to this map!");
};

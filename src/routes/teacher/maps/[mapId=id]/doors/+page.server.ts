import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const mapId = +params.mapId;
  const map = await prisma.map.findUnique({
    where: {
      id: mapId,
      creator: { schoolId: locals.user.schoolId },
    },
    select: { imgURL: true },
  });
  if (map) return { mapURL: map.imgURL };
  error(403, "You do not have access to this map!");
};

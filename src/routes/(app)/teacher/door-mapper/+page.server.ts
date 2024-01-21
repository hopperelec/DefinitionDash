import type { PageServerLoad } from "./$types";
import prisma from "$lib/prisma";

export const load: PageServerLoad = async ({ parent }) => {
  return {
    doors: prisma.door.findMany({
      where: {
        map_id: (await parent()).map_id,
      },
      select: {
        room1_id: true,
        room2_id: true,
      },
    }),
  };
};

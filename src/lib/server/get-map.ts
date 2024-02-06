import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export default async function getMap(schoolId: number, mapId: number) {
  const map: { id: number } = await prisma.map.findFirst({
    where: {
      id: mapId,
      creator: {
        schoolId: schoolId,
      },
    },
  });
  if (map) return map;
  throw error(403, "You do not have access to this map!");
}

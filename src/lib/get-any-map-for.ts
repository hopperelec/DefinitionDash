import prisma from "$lib/prisma";
import { error } from "@sveltejs/kit";

export default async function getAnyMapFor(schoolId: number) {
  const map = await prisma.map.findFirst({
    where: {
      creator: {
        schoolId: schoolId,
      },
    },
    select: { id: true },
  });
  if (map) return map;
  throw error(403, "You do not have access to any maps!");
}

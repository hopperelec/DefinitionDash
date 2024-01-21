import prisma from "$lib/prisma";

export function getMapFor(user: { school_id: number }) {
  return prisma.map.findFirst({
    where: {
      creator: {
        school_id: user.school_id,
      },
    },
  });
}

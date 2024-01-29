import prisma from "$lib/prisma";

export function getMapFor(user: { schoolId: number }) {
  return prisma.map.findFirst({
    where: {
      creator: {
        schoolId: user.schoolId,
      },
    },
  });
}

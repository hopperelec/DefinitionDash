import prisma from "$lib/server/prisma";

export default async function chooseSpawnpoint(mapId: number) {
  // Prisma doesn't support server-side rand, so I use a raw query to avoid unnecessarily selecting all the data
  const room: { id: bigint }[] = await prisma.$queryRaw`
    SELECT id
    FROM Room
    WHERE mapId = ${mapId}
      AND isSpawnpoint = true
    ORDER BY rand() LIMIT 1`;
  return room.length === 0 ? 1 : Number(room[0].id);
}

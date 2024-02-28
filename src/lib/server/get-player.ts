import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";

export default async function getPlayer(
  user: { id: number; schoolId: number },
  gameId: number,
): Promise<{ id: number }> {
  const player = await prisma.player.findFirst({
    where: {
      userId: user.id,
      gameId: gameId,
    },
    select: { id: true },
  });
  if (player) return player;
  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      map: {
        creator: {
          schoolId: user.schoolId,
        },
      },
    },
    select: {
      mapId: true,
    },
  });
  if (!game) error(403, "You do not have access to this game!");
  return prisma.player.create({
    data: {
      userId: user.id,
      gameId: gameId,
      currRoomId: await chooseSpawnpoint(game.mapId),
    },
    select: { id: true },
  });
}

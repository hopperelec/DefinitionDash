import prisma from "$lib/prisma";
import { error } from "@sveltejs/kit";
import getAnyMapFor from "$lib/get-any-map-for";

async function getGameFor(gameId: number, schoolId: number) {
  const game = await prisma.game.findFirst({
    where: {
      id: +gameId,
      map: {
        creator: {
          schoolId: schoolId,
        },
      },
    },
    select: {
      mapId: true,
    },
  });
  if (game) return game;
  throw error(403, "You do not have access to a game with the provided ID!");
}

async function chooseSpawnpoint(mapId: number) {
  const room: { id: bigint }[] =
    await prisma.$queryRaw`SELECT id FROM Room WHERE mapId = ${mapId} AND isSpawnpoint = true ORDER BY rand() LIMIT 1`;
  return room.length === 0 ? 1 : Number(room[0].id);
}

async function getExistingPlayerForGame(user: { id: number }, gameId: number) {
  return prisma.player.findFirst({
    where: {
      userId: user.id,
      gameId: gameId,
    },
    select: { id: true },
  });
}

export function getExistingPlayerForURL(user: { id: number }, url: URL) {
  const gameId = Number(url.searchParams.get("game"));
  if (gameId) return getExistingPlayerForGame(user, gameId);
}

export default async function getPlayerFor(
  user: { id: number; schoolId: number },
  url: URL,
): Promise<{ id: number }> {
  let gameId: number = Number(url.searchParams.get("game"));
  let mapId: number;
  if (gameId) {
    const player = await getExistingPlayerForGame(user, gameId);
    if (player) return player;
    mapId = (await getGameFor(gameId, user.schoolId)).mapId;
  } else {
    mapId = (await getAnyMapFor(user.schoolId)).id;
    const game = await prisma.game.create({
      data: {
        mapId: mapId,
      },
      select: { id: true },
    });
    gameId = game.id;
  }
  const spawnpoint = await chooseSpawnpoint(mapId);
  return prisma.player.create({
    data: {
      userId: user.id,
      gameId: gameId,
      currRoomId: spawnpoint,
    },
    select: { id: true },
  });
}

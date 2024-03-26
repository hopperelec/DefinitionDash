import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";
import ablyServer from "$lib/server/ably-server";

export const load = async ({ params, locals }) => {
  const gameId = +params.gameId;
  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
      state: "LOBBY",
      map: { creator: { schoolId: locals.user.schoolId } },
    },
    select: {
      mapId: true,
      players: {
        select: {
          isHost: true,
          user: { select: { id: true, name: true, picture: true } },
        },
      },
    },
  });
  if (!game) error(403, "You do not have access to this game's lobby!");
  if (!game.players.some((player) => player.user.id == locals.user.id)) {
    const spawnpoint = await chooseSpawnpoint(game.mapId);
    await prisma.player.create({
      data: {
        userId: locals.user.id,
        gameId,
        currRoomId: spawnpoint,
      },
    });
    const user = {
      id: locals.user.id,
      name: locals.user.name,
      picture: locals.user.picture,
    };
    game.players.push({ isHost: false, user });
    ablyServer.channels.get("game:" + gameId + ":lobby").publish("join", user);
  }
  return {
    userId: locals.user.id,
    players: game.players.map((player) => {
      return {
        isHost: player.isHost,
        ...player.user,
      };
    }),
  };
};

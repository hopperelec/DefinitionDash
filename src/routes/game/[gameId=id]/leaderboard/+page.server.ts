import getPlayerId from "$lib/server/get-player-id";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const playerId = await getPlayerId(locals.user, +params.gameId);
  const ret = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      isHost: true,
      user: { select: { id: true } },
      game: {
        select: {
          players: {
            select: {
              user: { select: { id: true, name: true } },
              points: true,
            },
          },
        },
      },
    },
  });
  if (!ret)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  return {
    userId: ret.user.id,
    isHost: ret.isHost,
    players: ret.game.players.map((player) => {
      return {
        id: player.user.id,
        name: player.user.name,
        points: player.points,
      };
    }),
  };
};

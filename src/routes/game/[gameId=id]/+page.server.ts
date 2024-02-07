import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { Player } from "@prisma/client";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const ret = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    include: {
      game: {
        select: {
          map: {
            select: { imgURL: true, id: true },
          },
        },
      },
    },
  });
  if (!ret)
    throw error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  const { game, ...playerData } = ret; // So that playerData doesn't contain duplicate data from game
  const props: {
    picture: string;
    player: Player;
    mapURL: string;
    mapId: number;
  } = {
    picture: locals.user.picture,
    player: playerData,
    mapURL: game.map.imgURL,
    mapId: game.map.id,
  };
  return props;
};

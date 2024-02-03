import type { LayoutServerLoad } from "./$types";
import getPlayerFor from "$lib/get-player-for";
import prisma from "$lib/prisma";
import { error } from "@sveltejs/kit";
import type { LocalDoor } from "$lib/types";
import type { Player } from "@prisma/client";

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const player = await getPlayerFor(locals.user, url);
  const ret = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    include: {
      game: {
        select: {
          map: {
            select: { imgURL: true, doors: true },
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
    mapData: string;
    doors: LocalDoor[];
  } = {
    picture: locals.user.picture,
    player: playerData,
    mapData: await (await fetch(game.map.imgURL)).text(),
    doors: game.map.doors,
  };
  return props;
};

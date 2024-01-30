import type { LayoutServerLoad } from "./$types";
import getPlayerFor from "$lib/get-player-for";
import prisma from "$lib/prisma";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const player = await getPlayerFor(locals.user, url);
  const playerData = await prisma.player.findUnique({
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
  if (!playerData)
    throw error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  return {
    picture: locals.user.picture,
    player: playerData,
    mapData: await (await fetch(playerData.game.map.imgURL)).text(),
    doors: playerData.game.map.doors,
  };
};

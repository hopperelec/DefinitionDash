import type { Player, ShopItem } from "@prisma/client";
import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const playerData = await prisma.player.findUnique({
    where: { id: player.id },
  });
  if (!playerData)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  const props: {
    shopItems: ShopItem[];
    player: Player;
  } = {
    shopItems: await prisma.shopItem.findMany(),
    player: playerData,
  };
  return props;
};

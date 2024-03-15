import type { ShopItem } from "@prisma/client";
import getPlayerId from "$lib/server/get-player-id";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const playerId = await getPlayerId(locals.user, +params.gameId);
  const playerData = await prisma.player.findUnique({
    where: { id: playerId },
    select: { userId: true, points: true },
  });
  if (!playerData)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  const props: {
    shopItems: ShopItem[];
    userId: number;
    points: number;
  } = {
    shopItems: await prisma.shopItem.findMany(),
    ...playerData,
  };
  return props;
};

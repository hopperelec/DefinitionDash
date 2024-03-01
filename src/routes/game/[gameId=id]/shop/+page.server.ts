import type { ShopItem } from "@prisma/client";
import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const playerData = await prisma.player.findUnique({
    where: { id: player.id },
    select: { userId: true, gameId: true, points: true },
  });
  if (!playerData)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  const props: {
    shopItems: ShopItem[];
    userId: number;
    gameId: number;
    points: number;
  } = {
    shopItems: await prisma.shopItem.findMany(),
    ...playerData,
  };
  return props;
};

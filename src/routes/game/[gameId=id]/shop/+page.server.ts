import type { Player, ShopItem } from "@prisma/client";
import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const props: {
    shopItems: ShopItem[];
    player: Player;
  } = {
    shopItems: await prisma.shopItem.findMany(),
    player: await prisma.player.findUnique({
      where: {
        id: player.id,
      },
    }),
  };
  return props;
};

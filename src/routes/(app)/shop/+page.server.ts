import type { Player, ShopItem } from "@prisma/client";
import getPlayerFor from "$lib/get-player-for";
import prisma from "$lib/prisma";

export const load = async ({ url, locals }) => {
  const player = await getPlayerFor(locals.user, url);
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

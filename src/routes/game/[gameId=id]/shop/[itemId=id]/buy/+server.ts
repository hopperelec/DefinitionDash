import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { getExistingPlayer } from "$lib/server/get-player";

const ACTIONS: { [key: string]: (playerId: number) => Promise<boolean> } = {
  randomTeleport: async (playerId) => {
    const playerData = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      select: {
        game: {
          select: {
            mapId: true,
          },
        },
      },
    });
    const room: { id: bigint }[] =
      await prisma.$queryRaw`SELECT id FROM Room WHERE mapId = ${playerData.game.mapId} ORDER BY rand() LIMIT 1`;
    if (room.length === 0) return false;
    await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        currRoomId: Number(room[0].id),
      },
    });
    return true;
  },
};

export const GET = async ({ params, locals }) => {
  const player = await getExistingPlayer(locals.user, +params.gameId);
  if (!player) throw error(400, "You must be in a game to answer a question!");
  const shopItem = await prisma.shopItem.findUnique({
    where: {
      id: +params.itemId,
    },
    select: {
      cost: true,
      action: true,
    },
  });
  if (!shopItem) throw error(404, "This item does not exist!");
  const playerData = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    select: {
      currQuestionId: true,
      points: true,
    },
  });
  if (playerData.currQuestionId)
    throw error(400, "You can not buy an item while answering a question!");
  if (playerData.points < shopItem.cost)
    throw error(400, "You do not have enough points to buy this item");
  const action = ACTIONS[shopItem.action];
  if (!action)
    throw error(
      500,
      "An unexpected error occurred trying to find find the reward for this item",
    );
  if (await action(player.id)) {
    const newPlayerData = await prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        points: {
          decrement: shopItem.cost,
        },
      },
    });
    return json(newPlayerData);
  } else
    throw error(
      500,
      "An unexpected error occurred trying to reward you for this item",
    );
};

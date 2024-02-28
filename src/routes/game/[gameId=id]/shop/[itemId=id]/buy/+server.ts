import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import ablyServer from "$lib/server/ably-server";
import type { User } from "@prisma/client";

type ActionDetails = {
  playerId: number;
  playerPoints: number;
  user: User;
  itemId: number;
  itemCost: number;
};

const ACTIONS: { [key: string]: (details: ActionDetails) => Promise<boolean> } =
  {
    randomTeleport: async ({ playerId, user }) => {
      const player = await prisma.player.findUnique({
        where: {
          id: playerId,
        },
        select: {
          game: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!player)
        error(
          500,
          "An unexpected error occurred while trying to retrieve your player data",
        );
      const room: { id: bigint }[] =
        await prisma.$queryRaw`SELECT id FROM Room WHERE mapId = (SELECT mapId from Game WHERE id=${player.game.id}) ORDER BY rand() LIMIT 1`;
      if (room.length === 0) return false;
      const roomId = Number(room[0].id);
      await prisma.player.update({
        where: {
          id: playerId,
        },
        data: {
          currRoomId: roomId,
        },
      });
      await ablyServer.channels.get("game:" + player.game.id).publish("move", {
        userId: user.id,
        roomId: roomId,
      });
      return true;
    },
  };

export const GET = async ({ params, locals }) => {
  const shopItem = await prisma.shopItem.findUnique({
    where: {
      id: +params.itemId,
    },
    select: {
      cost: true,
      action: true,
    },
  });
  if (!shopItem) error(404, "This item does not exist!");
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: {
        userId: locals.user.id,
        gameId: +params.gameId,
      },
    },
    select: {
      id: true,
      currQuestionId: true,
      points: true,
    },
  });
  if (!player) error(400, "You are not in this game!");
  if (player.currQuestionId)
    error(400, "You can not buy an item while answering a question!");
  if (player.points < shopItem.cost)
    error(400, "You do not have enough points to buy this item");
  const action = ACTIONS[shopItem.action];
  if (!action)
    error(
      500,
      "An unexpected error occurred trying to find find the reward for this item",
    );
  if (
    await action({
      playerId: player.id,
      playerPoints: player.points,
      user: locals.user,
      itemId: +params.itemId,
      itemCost: shopItem.cost,
    })
  ) {
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
    error(
      500,
      "An unexpected error occurred trying to reward you for this item",
    );
};

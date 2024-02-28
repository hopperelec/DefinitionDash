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

async function moveRoom(
  userId: number,
  gameId: number,
  playerId: number,
  roomId: number,
) {
  await prisma.player.update({
    where: {
      id: playerId,
    },
    data: {
      currRoomId: roomId,
    },
  });
  await ablyServer.channels.get("game:" + gameId).publish("move", {
    userId: userId,
    roomId: roomId,
  });
}

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
      const rooms: { id: bigint }[] =
        await prisma.$queryRaw`SELECT id FROM Room WHERE mapId = (SELECT mapId from Game WHERE id=${player.game.id}) ORDER BY rand() LIMIT 1`;
      if (rooms.length === 0) return false;
      await moveRoom(user.id, playerId, player.game.id, Number(rooms[0].id));
      return true;
    },

    swapRandPlayer: async ({ playerId, user }) => {
      const player = await prisma.player.findUnique({
        where: {
          id: playerId,
        },
        select: {
          currRoomId: true,
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
      const randPlayers: { id: bigint; userId: bigint; currRoomId: bigint }[] =
        await prisma.$queryRaw`SELECT id,userId,currRoomId FROM Player where gameId = ${player.game.id} ORDER BY rand() LIMIT 1`;
      if (randPlayers.length === 0) return false;
      const randPlayer = randPlayers[0];
      await moveRoom(
        user.id,
        player.game.id,
        playerId,
        Number(randPlayer.currRoomId),
      );
      await moveRoom(
        Number(randPlayer.userId),
        player.game.id,
        Number(randPlayer.id),
        player.currRoomId,
      );
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

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
  svgRef: number,
) {
  await prisma.player.update({
    where: { id: playerId },
    data: { currRoomId: roomId },
  });
  await ablyServer.channels.get("game:" + gameId).publish("move", {
    userId: userId,
    svgRef: svgRef,
  });
}

const ACTIONS: { [key: string]: (details: ActionDetails) => Promise<boolean> } =
  {
    randomTeleport: async ({ playerId, user }) => {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
          game: { select: { id: true, mapId: true } },
        },
      });
      if (!player)
        error(
          500,
          "An unexpected error occurred while trying to retrieve your player data",
        );
      const rooms: {
        id: bigint;
        svgRef: bigint;
      }[] = await prisma.$queryRaw`
        SELECT id,svgRef
        FROM Room
        WHERE mapId = ${player.game.mapId}
        ORDER BY rand() LIMIT 1`;
      if (rooms.length === 0) return false;
      await moveRoom(
        user.id,
        playerId,
        player.game.id,
        Number(rooms[0].id),
        Number(rooms[0].svgRef),
      );
      return true;
    },

    swapRandPlayer: async ({ playerId, user }) => {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
          currRoom: { select: { id: true, svgRef: true } },
          game: { select: { id: true } },
        },
      });
      if (!player)
        error(
          500,
          "An unexpected error occurred while trying to retrieve your player data",
        );
      const randPlayers: {
        id: bigint;
        userId: bigint;
        currRoomId: bigint;
        svgRef: bigint;
      }[] = await prisma.$queryRaw`
        SELECT Player.id,userId,currRoomId,svgRef
        FROM Player
         INNER JOIN Room
            ON Room.id = Player.currRoomId
        WHERE gameId = ${player.game.id}
          AND Player.id <> ${playerId}
        ORDER BY rand() LIMIT 1`;
      if (randPlayers.length === 0)
        error(400, "There are no other players in this game!");
      const randPlayer = randPlayers[0];
      await moveRoom(
        user.id,
        player.game.id,
        playerId,
        Number(randPlayer.currRoomId),
        Number(randPlayer.svgRef),
      );
      await moveRoom(
        Number(randPlayer.userId),
        player.game.id,
        Number(randPlayer.id),
        player.currRoom.id,
        player.currRoom.svgRef,
      );
      return true;
    },
  };

export const GET = async ({ params, locals }) => {
  const shopItem = await prisma.shopItem.findUnique({
    where: { id: +params.itemId },
    select: { cost: true, action: true },
  });
  if (!shopItem) error(404, "This item does not exist!");
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId: +params.gameId },
    },
    select: { id: true, currQuestionId: true, points: true },
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
      where: { id: player.id },
      data: { points: { decrement: shopItem.cost } },
    });
    return json(newPlayerData);
  } else
    error(
      500,
      "An unexpected error occurred trying to reward you for this item",
    );
};

import { error } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import ablyServer from "$lib/server/ably-server";
import type { User } from "@prisma/client";

type ActionDetails = {
  playerId: number;
  playerPoints: number;
  user: User;
  gameId: number;
  itemId: number;
  itemCost: number;
  actionParams: string;
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

const ACTIONS: { [key: string]: (details: ActionDetails) => Promise<void> } = {
  randomTeleport: async ({ playerId, gameId, user }) => {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        game: { select: { mapId: true } },
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
    if (rooms.length === 0)
      error(
        500,
        "An unexpected error occurred while trying to choose a room to teleport you to",
      );
    await moveRoom(
      user.id,
      playerId,
      gameId,
      Number(rooms[0].id),
      Number(rooms[0].svgRef),
    );
  },

  swapRandPlayer: async ({ playerId, gameId, user }) => {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        currRoom: { select: { id: true, svgRef: true } },
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
        WHERE gameId = ${gameId}
          AND Player.id <> ${playerId}
        ORDER BY rand() LIMIT 1`;
    if (randPlayers.length === 0)
      error(400, "There are no other players in this game!");
    const randPlayer = randPlayers[0];
    await moveRoom(
      user.id,
      gameId,
      playerId,
      Number(randPlayer.currRoomId),
      Number(randPlayer.svgRef),
    );
    await moveRoom(
      Number(randPlayer.userId),
      gameId,
      Number(randPlayer.id),
      player.currRoom.id,
      player.currRoom.svgRef,
    );
  },

  subtractRandPlayerPoints: async ({ playerId, gameId, actionParams }) => {
    const randPlayers: {
      id: bigint;
      userId: bigint;
      points: bigint;
    }[] = await prisma.$queryRaw`
        SELECT Player.id,userId,points
        FROM Player
        WHERE gameId = ${gameId}
          AND Player.id <> ${playerId}
        ORDER BY rand() LIMIT 1`;
    if (randPlayers.length === 0)
      error(400, "There are no other players in this game!");
    const randPlayer = randPlayers[0];
    const newPoints = Math.max(0, Number(randPlayer.points) - +actionParams);
    await prisma.player.update({
      where: { id: Number(randPlayer.id) },
      data: { points: newPoints },
    });
    await ablyServer.channels
      .get("game:" + gameId + ":" + randPlayer.userId)
      .publish("points", {
        points: newPoints,
      });
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

  const actionParts = shopItem.action.split("/", 2);
  const action = ACTIONS[actionParts[0]];
  if (!action)
    error(
      500,
      "An unexpected error occurred trying to find find the reward for this item",
    );
  await prisma.player.update({
    where: { id: player.id },
    data: { points: { decrement: shopItem.cost } },
  });
  await action({
    playerId: player.id,
    playerPoints: player.points,
    user: locals.user,
    gameId: +params.gameId,
    itemId: +params.itemId,
    itemCost: shopItem.cost,
    actionParams: actionParts[1],
  });
  return new Response();
};

import { error } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import {
  moveRoom,
  unclaimRooms,
  updateRealtimePoints,
} from "$lib/server/ably-server";
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
      {
        id: playerId,
        userId: user.id,
        gameId,
      },
      {
        id: Number(rooms[0].id),
        svgRef: Number(rooms[0].svgRef),
      },
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
      error(403, "There are no other players in this game!");
    const randPlayer = randPlayers[0];
    await moveRoom(
      {
        id: playerId,
        userId: user.id,
        gameId,
      },
      {
        id: Number(randPlayer.currRoomId),
        svgRef: Number(randPlayer.svgRef),
      },
    );
    await moveRoom(
      {
        id: Number(randPlayer.id),
        userId: Number(randPlayer.userId),
        gameId,
      },
      player.currRoom,
    );
  },

  // actionParams is an integer number of points to subtract
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
      error(403, "There are no other players in this game!");
    const randPlayer = randPlayers[0];
    const newPoints = Math.max(0, Number(randPlayer.points) - +actionParams);
    await prisma.player.update({
      where: { id: Number(randPlayer.id) },
      data: { points: newPoints },
    });
    updateRealtimePoints(gameId, Number(randPlayer.userId), newPoints);
  },

  // actionParams is an integer number of rooms (e.g: "5" -> unclaim 5 rooms)
  unclaimAbsoluteRooms: async ({ gameId, actionParams }) => {
    const rooms: { roomId: bigint; svgRef: bigint }[] = await prisma.$queryRaw`
        SELECT roomId
        FROM ClaimedRoom
        WHERE gameId = ${gameId}
        ORDER BY rand()
        LIMIT ${+actionParams}`;
    if (rooms.length === 0) error(500, "No rooms available to unclaim!");
    await unclaimRooms(gameId, rooms);
  },

  // actionParams is a float percentage (e.g: "50" -> unclaim 50% of rooms)
  unclaimPercentageRooms: async ({ gameId, actionParams }) => {
    const rooms: { roomId: bigint; svgRef: bigint }[] = await prisma.$queryRaw`
        SELECT roomId
        FROM ClaimedRoom
        WHERE gameId = ${gameId}
        ORDER BY rand()`;
    if (rooms.length === 0) error(500, "No rooms available to unclaim!");
    // MySQL doesn't support dynamic limits, so need to limit from Javascript
    await unclaimRooms(
      gameId,
      rooms.slice(0, (rooms.length * +actionParams) / 100),
    );
  },
};

export const GET = async ({ params, locals }) => {
  const gameId = +params.gameId;
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId },
      game: { state: "ONGOING" },
      kicked: false,
    },
    select: { id: true, currQuestionId: true, points: true },
  });
  if (!player)
    error(403, "You are not in this game or or the game is not ongoing!");
  if (player.currQuestionId)
    error(403, "You can not buy an item while answering a question!");
  const itemId = +params.itemId;
  const shopItem = await prisma.shopItem.findUnique({
    where: { id: itemId },
    select: { cost: true, action: true },
  });
  if (!shopItem) error(404, "This item does not exist!");
  if (player.points < shopItem.cost)
    error(403, "You do not have enough points to buy this item");

  const actionParts = shopItem.action.split("/", 2);
  const action = ACTIONS[actionParts[0]];
  if (!action)
    error(
      500,
      "An unexpected error occurred trying to find find the reward for this item",
    );
  await action({
    playerId: player.id,
    playerPoints: player.points,
    user: locals.user,
    gameId,
    itemId,
    itemCost: shopItem.cost,
    actionParams: actionParts[1],
  });
  await prisma.player.update({
    where: { id: player.id },
    data: { points: { decrement: shopItem.cost } },
  });
  updateRealtimePoints(gameId, locals.user.id, player.points - shopItem.cost);
  return new Response();
};

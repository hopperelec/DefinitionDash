import ably from "ably";
import { ABLY_API_KEY } from "$env/static/private";
import prisma from "$lib/server/prisma";

const ablyServer = new ably.Realtime({ key: ABLY_API_KEY });
export default ablyServer;

export function updateRealtimePoints(
  gameId: number,
  userId: number,
  points: number,
) {
  ablyServer.channels
    .get("player:" + gameId + ":" + userId)
    .publish("points", { points })
    .then();
  ablyServer.channels
    .get("game:" + gameId + ":points")
    .publish("points", { userId, points })
    .then();
}

export async function moveRoom(
  player: {
    id: number;
    userId: number;
    gameId: number;
  },
  room: {
    id: number;
    svgRef: number;
  },
  canClaimRoom?: boolean,
) {
  if (canClaimRoom == undefined) {
    const claimedRoom = await prisma.claimedRoom.findUnique({
      where: { roomId_gameId: { roomId: room.id, gameId: player.gameId } },
    });
    canClaimRoom = !claimedRoom;
  }
  if (canClaimRoom) {
    const newPlayerData = await prisma.player.update({
      where: { id: player.id },
      data: {
        currRoom: {
          connect: { id: room.id },
          update: { gamesClaimedIn: { create: { gameId: player.gameId } } },
        },
        points: { increment: 1 },
      },
      select: { points: true },
    });
    updateRealtimePoints(player.gameId, player.userId, newPlayerData.points);
  } else {
    await prisma.player.update({
      where: { id: player.id },
      data: { currRoomId: room.id },
    });
  }
  ablyServer.channels
    .get("game:" + player.gameId + ":positions")
    .publish("move", {
      userId: player.userId,
      svgRef: room.svgRef,
    })
    .then();
}

export async function unclaimRooms(
  gameId: number,
  rooms: { roomId: bigint; svgRef: bigint }[],
) {
  await prisma.claimedRoom.deleteMany({
    where: {
      gameId,
      roomId: { in: rooms.map((room) => Number(room.roomId)) },
    },
  });
  ablyServer.channels
    .get("game:" + gameId + ":positions")
    .publish(
      "unclaim",
      rooms.map((room) => Number(room.svgRef)),
    )
    .then();
}

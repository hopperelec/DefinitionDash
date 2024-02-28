import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const GET = async ({ url, params, locals }) => {
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: {
        userId: locals.user.id,
        gameId: +params.gameId,
      },
    },
    select: {
      id: true,
      currRoomId: true,
      currQuestion: {
        select: {
          definition: true,
        },
      },
      game: {
        select: {
          mapId: true,
        },
      },
    },
  });
  if (!player) error(400, "You are not in this game!");
  if (player.currQuestion) return new Response(player.currQuestion.definition);
  const roomRequested = url.searchParams.get("room");
  if (!roomRequested) error(400, "You must select a room you wish to move to");
  const door = await prisma.door.findUnique({
    where: {
      mapId_svgRef1_svgRef2: {
        mapId: player.game.mapId,
        svgRef1: Math.min(player.currRoomId, +roomRequested),
        svgRef2: Math.max(player.currRoomId, +roomRequested),
      },
    },
    select: { id: true },
  });
  if (!door)
    error(
      400,
      "There is no door between the room you are currently in and the room you selected!",
    );
  const definitions: { id: bigint; definition: string }[] =
    await prisma.$queryRaw`SELECT id,definition FROM Definition ORDER BY rand() LIMIT 1`;
  await prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      currQuestionId: Number(definitions[0].id),
      currMoveId: +roomRequested,
    },
  });
  return new Response(definitions[0].definition);
};

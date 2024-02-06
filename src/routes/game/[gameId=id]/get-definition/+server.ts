import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import { getExistingPlayer } from "$lib/server/get-player";

export const GET = async ({ url, params, locals }) => {
  const player = await getExistingPlayer(locals.user, +params.gameId);
  if (!player) throw error(400, "You must be in a game to get a definition!");
  const playerData = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    select: {
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
  if (!playerData)
    throw error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  if (playerData.currQuestion)
    return new Response(playerData.currQuestion.definition);
  const roomRequested = url.searchParams.get("room");
  if (!roomRequested)
    throw error(400, "You must select a room you wish to move to");
  const door = await prisma.door.findUnique({
    where: {
      mapId_svgRef1Id_svgRef2Id: {
        mapId: playerData.game.mapId,
        svgRef1Id: Math.min(playerData.currRoomId, +roomRequested),
        svgRef2Id: Math.max(playerData.currRoomId, +roomRequested),
      },
    },
    select: { id: true },
  });
  if (!door)
    throw error(
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

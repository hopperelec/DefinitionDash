import prisma from "$lib/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";
import { getExistingPlayerForURL } from "$lib/get-player-for";

export const GET: RequestHandler = async ({ url, locals }) => {
  const player = await getExistingPlayerForURL(locals.user, url);
  if (!player) throw error(400, "You must be in a game to get a definition!");
  const playerData = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    select: {
      currQuestion: {
        select: {
          definition: true,
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
  // const roomRequested = url.searchParams.get("room");
  // if (!roomRequested) throw error(400, "You must select a room you wish to move to");
  // const room1Id = Math.min(playerData.currRoomId, roomRequested);
  // const room2Id = Math.max(playerData.currRoomId, roomRequested);
  // const door = await prisma.door.findUnique({
  //   where: {
  //     mapId: playerData.game()
  //     room1Id,
  //     room2Id,
  //   }
  // });
  const definitions: { id: bigint; definition: string }[] =
    await prisma.$queryRaw`SELECT id,definition FROM Definition ORDER BY rand() LIMIT 1`;
  await prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      currQuestionId: Number(definitions[0].id),
    },
  });
  return new Response(definitions[0].definition);
};

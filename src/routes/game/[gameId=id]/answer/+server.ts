import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import ablyServer, { updatePoints } from "$lib/server/ably-server";

export const POST = async ({ request, params, locals }) => {
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId: +params.gameId },
      game: { isOngoing: true },
    },
    select: {
      id: true,
      currQuestion: { select: { answerRegex: true } },
      currMove: { select: { id: true, svgRef: true } },
    },
  });
  if (!player) error(403, "You are not in this game or the game has ended!");
  if (!player.currQuestion)
    error(400, "You currently have no question to answer!");
  if (!player.currMove)
    error(
      500,
      "An unexpected error occurred while trying to get the room you were trying to move to",
    );
  const correct = new RegExp(
    "^" + player.currQuestion.answerRegex + "$",
    "i",
  ).test(await request.text());
  if (correct) {
    const newPlayerData = await prisma.player.update({
      where: { id: player.id },
      data: {
        currQuestionId: null,
        points: { increment: 1 },
        currRoomId: player.currMove.id,
        currMoveId: null,
      },
      select: { points: true },
    });
    await ablyServer.channels
      .get("game:" + params.gameId + ":positions")
      .publish("move", {
        userId: locals.user.id,
        svgRef: player.currMove.svgRef,
      });
    await updatePoints(+params.gameId, locals.user.id, newPlayerData.points);
  }
  return json({ correct });
};

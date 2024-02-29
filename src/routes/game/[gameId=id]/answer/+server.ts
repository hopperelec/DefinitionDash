import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import ablyServer from "$lib/server/ably-server";

export const POST = async ({ request, params, locals }) => {
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId: +params.gameId },
    },
    select: {
      id: true,
      currQuestion: { select: { answerRegex: true } },
      currMove: { select: { id: true, svgRef: true } },
    },
  });
  if (!player) error(400, "You are not in this game!");
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
    await prisma.player.update({
      where: { id: player.id },
      data: {
        currQuestionId: null,
        points: { increment: 1 },
        currRoomId: player.currMove.id,
        currMoveId: null,
      },
    });
    await ablyServer.channels.get("game:" + params.gameId).publish("move", {
      userId: locals.user.id,
      svgRef: player.currMove.svgRef,
    });
  }
  return json({ correct });
};

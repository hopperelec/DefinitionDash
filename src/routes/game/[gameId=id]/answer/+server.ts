import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { getExistingPlayer } from "$lib/server/get-player";

export const POST = async ({ request, params, locals }) => {
  const player = await getExistingPlayer(locals.user, +params.gameId);
  if (!player) throw error(400, "You must be in a game to answer a question!");
  const playerData = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    select: {
      currQuestion: {
        select: {
          answerRegex: true,
        },
      },
      currMoveId: true,
    },
  });
  if (!playerData?.currQuestion)
    throw error(400, "You currently have no question to answer!");
  const correct = new RegExp(
    "^" + playerData.currQuestion.answerRegex + "$",
    "i",
  ).test(await request.text());
  if (correct) {
    await prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        currQuestionId: null,
        points: {
          increment: 1,
        },
        currRoomId: playerData.currMoveId,
        currMoveId: null,
      },
    });
  }
  return json({ correct });
};

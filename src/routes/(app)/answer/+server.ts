import { error, json } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import { getExistingPlayerForURL } from "$lib/get-player-for";

export const GET = async ({ url, locals }) => {
  const answer = url.searchParams.get("answer");
  if (!answer) throw error(400, "Answer not provided");
  const player = await getExistingPlayerForURL(locals.user, url);
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
  ).test(answer);
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

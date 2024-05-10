import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { movePlayerToRoom } from "$lib/server/ably-server";

export const POST = async ({ request, params, locals }) => {
  const gameId = +params.gameId;
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId },
      kicked: false,
    },
    select: {
      id: true,
      currQuestion: { select: { answerRegex: true } },
      currMove: {
        select: {
          id: true,
          svgRef: true,
          gamesClaimedIn: {
            where: { gameId },
            select: { gameId: true }, // Need to select something
          },
        },
      },
    },
  });
  if (!player) error(403, "You are not in this game!");
  if (!player.currQuestion)
    error(403, "You currently have no question to answer!");
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
        currQuestion: { disconnect: true },
        currMove: { disconnect: true },
      },
    });
    await movePlayerToRoom(
      {
        id: player.id,
        userId: locals.user.id,
        gameId,
      },
      player.currMove,
      player.currMove.gamesClaimedIn.length == 0,
    );
  }
  return json({ correct });
};

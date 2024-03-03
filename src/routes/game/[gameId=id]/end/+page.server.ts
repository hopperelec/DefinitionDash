import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import ablyServer from "$lib/server/ably-server";

export const load = async ({ params, locals }) => {
  const player = await prisma.player.findUnique({
    where: {
      userId_gameId: { userId: locals.user.id, gameId: +params.gameId },
    },
    select: {
      isHost: true,
      game: { select: { isOngoing: true } },
    },
  });
  if (!player) error(403, "You are not in this game!");
  if (player.game.isOngoing) {
    if (!player.isHost)
      error(
        403,
        "This game is ongoing and you are not a host but only a host can end a game!",
      );
    await prisma.game.update({
      where: { id: +params.gameId },
      data: { isOngoing: false },
    });
    await ablyServer.channels
      .get("game:" + +params.gameId + ":announcements")
      .publish("end", null);
  }
};

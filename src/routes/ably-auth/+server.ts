import ablyServer from "$lib/server/ably-server";
import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

export const GET = async ({ locals }) => {
  const userData = await prisma.user.findUnique({
    where: { id: locals.user.id },
    include: {
      players: { select: { id: true, gameId: true } },
    },
  });
  if (!userData)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your user data",
    );
  return json(
    await ablyServer.auth.createTokenRequest({
      capability: userData.players.reduce(
        (acc, player) => {
          acc["game:" + player.gameId] = ["subscribe"];
          acc["game:" + player.gameId + ":announcements"] = ["subscribe"];
          acc["game:" + player.gameId + ":" + locals.user.id] = ["subscribe"];
          return acc;
        },
        {} as { [key: string]: ["subscribe"] },
      ),
    }),
  );
};

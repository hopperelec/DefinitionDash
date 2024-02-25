import ablyServer from "$lib/server/ably-server";
import { error, json } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

export const GET = async ({ locals }) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: locals.user.id,
    },
    include: {
      players: {
        select: {
          gameId: true,
        },
      },
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
        (acc, item) => {
          const key = "game:" + item.gameId;
          acc[key] = ["subscribe"];
          return acc;
        },
        {} as { [key: string]: ["subscribe"] },
      ),
    }),
  );
};

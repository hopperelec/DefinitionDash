import prisma from "$lib/server/prisma";
import getAnyMapFor from "$lib/server/get-any-map-for";
import { redirect } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";

export const GET = async ({ locals }) => {
  const map = await getAnyMapFor(locals.user.schoolId);
  const playerData = await prisma.player.create({
    data: {
      user: {
        connect: {
          id: locals.user.id,
        },
      },
      game: {
        create: { mapId: map.id },
      },
      currRoom: {
        connect: {
          id: await chooseSpawnpoint(map.id),
        },
      },
    },
    select: {
      gameId: true,
    },
  });
  throw redirect(302, "/game/" + playerData.gameId);
};

import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const ret = await prisma.player.findUnique({
    where: { id: player.id },
    select: {
      points: true,
      isHost: true,
      user: { select: { id: true } },
      game: {
        select: {
          map: { select: { id: true, imgURL: true } },
          players: {
            select: {
              user: { select: { id: true, picture: true } },
              currRoom: { select: { svgRef: true } },
            },
          },
        },
      },
    },
  });
  if (!ret)
    error(
      500,
      "An unexpected error occurred while trying to retrieve your player data",
    );
  type Opponents = {
    [key: number]: {
      picture: string | null;
      currSvgRef: number;
    };
  };
  const players: Opponents = {};
  for (const player of ret.game.players) {
    players[player.user.id] = {
      picture: player.user.picture,
      currSvgRef: player.currRoom.svgRef,
    };
  }
  const props: {
    players: Opponents;
    map: {
      id: number;
      imgURL: string;
    };
    userId: number;
    isHost: boolean;
    currPoints: number;
  } = {
    players,
    map: ret.game.map,
    userId: ret.user.id,
    isHost: ret.isHost,
    currPoints: ret.points,
  };
  return props;
};

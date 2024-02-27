import getPlayer from "$lib/server/get-player";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { Player } from "@prisma/client";

export const load = async ({ params, locals }) => {
  const player = await getPlayer(locals.user, +params.gameId);
  const ret = await prisma.player.findUnique({
    where: {
      id: player.id,
    },
    include: {
      game: {
        select: {
          map: {
            select: {
              id: true,
              imgURL: true,
              rooms: {
                select: {
                  id: true,
                  svgRef: true,
                },
              },
            },
          },
          players: {
            select: {
              user: {
                select: {
                  id: true,
                  picture: true,
                },
              },
              currRoomId: true,
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
  const { game, ...playerData } = ret; // So that playerData doesn't contain duplicate data from game
  const props: {
    player: Player;
    players: {
      user: {
        id: number;
        picture: string | null;
      };
      currRoomId: number;
    }[];
    map: {
      id: number;
      imgURL: string;
      rooms: {
        id: number;
        svgRef: number;
      }[];
    };
  } = {
    player: playerData,
    players: game.players,
    map: game.map,
  };
  return props;
};

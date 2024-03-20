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
      points: true,
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
    ablyServer.channels
      .get("game:" + +params.gameId + ":announcements")
      .publish("end", null);
  }
  const ret = await prisma.game.findUnique({
    where: { id: +params.gameId },
    select: {
      map: { select: { imgURL: true } },
      claimedRooms: {
        select: {
          room: { select: { svgRef: true } },
        },
      },
      players: {
        select: {
          points: true,
          user: { select: { id: true, name: true, picture: true } },
          currRoom: { select: { svgRef: true } },
        },
        orderBy: { points: "desc" },
      },
      _count: {
        select: { players: { where: { points: { gt: player.points } } } },
      },
    },
  });
  if (!ret)
    error(
      500,
      "An unexpected error occurred while trying to retrieve the game data",
    );
  const props: {
    mapImgURL: string;
    leaderboardPosition: number;
    claimedRooms: number[];
    players: {
      points: number;
      name: string;
      picture: string | null;
      currSvgRef: number;
    }[];
  } = {
    mapImgURL: ret.map.imgURL,
    leaderboardPosition: ret._count.players + 1,
    claimedRooms: ret.claimedRooms.map(
      (claimedRoom) => claimedRoom.room.svgRef,
    ),
    players: ret.players.map((player) => {
      return {
        points: player.points,
        name: player.user.name || "User " + player.user.id,
        picture: player.user.picture,
        currSvgRef: player.currRoom.svgRef,
      };
    }),
  };
  return props;
};

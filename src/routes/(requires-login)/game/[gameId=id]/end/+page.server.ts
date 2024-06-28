import ablyServer from "$lib/server/ably-server";
import prisma from "$lib/server/prisma";
import type { PreorderedLeaderboardPlayer } from "$lib/types";
import { error } from "@sveltejs/kit";

async function endGame(gameId: number) {
	await prisma.game.update({
		where: { id: gameId },
		data: { state: "ENDED" },
	});
	ablyServer.channels.get(`game:${gameId}`).publish("end", null).then();
}

export const load = async ({ params, locals }) => {
	const gameId = +params.gameId;
	const player = await prisma.player.findUnique({
		where: { userId_gameId: { userId: locals.user.id, gameId } },
		select: {
			isHost: true,
			points: true,
			game: { select: { state: true } },
		},
	});
	if (!player) error(403, "You are not in this game!");
	if (player.game.state === "LOBBY")
		error(403, "You can't end a game from the lobby!");

	if (player.game.state === "ONGOING") {
		if (!player.isHost)
			error(
				403,
				"This game has not ended and you are not a host but only a host can end a game!",
			);
		await endGame(gameId);
	}

	const ret = await prisma.game.findUnique({
		where: { id: gameId },
		select: {
			map: { select: { imgURL: true } },
			claimedRooms: {
				select: {
					room: { select: { svgRef: true } },
				},
			},
			players: {
				where: { kicked: false },
				select: {
					isHost: true,
					points: true,
					user: { select: { id: true, name: true, picture: true } },
					currRoom: { select: { svgRef: true } },
				},
				orderBy: { points: "desc" },
			},
			// Count the number of players with more points than this player
			// (used to find leaderboardPosition)
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
		players: (PreorderedLeaderboardPlayer & { currSvgRef: number })[];
	} = {
		mapImgURL: ret.map.imgURL,
		leaderboardPosition: ret._count.players + 1,
		claimedRooms: ret.claimedRooms.map(
			(claimedRoom) => claimedRoom.room.svgRef,
		),
		players: ret.players.map((player) => {
			return {
				...player,
				...player.user,
				currSvgRef: player.currRoom.svgRef,
			};
		}),
	};
	return props;
};

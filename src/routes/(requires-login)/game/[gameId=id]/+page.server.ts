import getPlayerId from "$lib/server/get-player-id";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
	const playerId = await getPlayerId(locals.user, +params.gameId);
	const ret = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			points: true,
			isHost: true,
			game: {
				select: {
					map: { select: { id: true, imgURL: true } },
					players: {
						where: { kicked: false },
						select: {
							user: { select: { id: true, picture: true } },
							currRoom: { select: { svgRef: true } },
						},
					},
					claimedRooms: {
						select: {
							room: { select: { svgRef: true } },
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

	// Restructure player data to be keyed by ID
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
		map: { id: number; imgURL: string };
		claimedRooms: number[];
		isHost: boolean;
		currPoints: number;
	} = {
		players,
		map: ret.game.map,
		claimedRooms: ret.game.claimedRooms.map(
			(claimedRoom) => claimedRoom.room.svgRef,
		),
		isHost: ret.isHost,
		currPoints: ret.points,
	};
	return props;
};

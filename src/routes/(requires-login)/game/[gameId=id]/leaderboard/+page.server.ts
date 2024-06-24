import getPlayerId from "$lib/server/get-player-id";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
	const playerId = await getPlayerId(locals.user, +params.gameId);
	const ret = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			isHost: true,
			game: {
				select: {
					players: {
						where: { kicked: false },
						select: {
							user: { select: { id: true, name: true, picture: true } },
							points: true,
							isHost: true,
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
	return {
		userId: locals.user.id,
		isHost: ret.isHost,
		players: ret.game.players.map((player) => {
			return {
				...player,
				...player.user,
				kickable: ret.isHost
					? !player.isHost && player.user.id !== locals.user.id
					: undefined,
			};
		}),
	};
};

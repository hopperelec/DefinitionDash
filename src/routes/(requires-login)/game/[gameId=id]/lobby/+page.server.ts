import ablyServer from "$lib/server/ably-server";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
	const gameId = +params.gameId;
	const game = await prisma.game.findUnique({
		where: {
			id: gameId,
			state: "LOBBY",
			map: { creator: { schoolId: locals.user.schoolId } },
		},
		select: {
			mapId: true,
			players: {
				select: {
					isHost: true,
					kicked: true,
					user: { select: { id: true, name: true, picture: true } },
				},
			},
		},
	});
	if (!game) error(403, "You do not have access to this game's lobby!");

	const self = game.players.filter(
		(player) => player.user.id === locals.user.id,
	)[0];
	if (!self) {
		const spawnpoint = await chooseSpawnpoint(game.mapId);
		await prisma.player.create({
			data: {
				userId: locals.user.id,
				gameId,
				currRoomId: spawnpoint,
			},
		});
		const user = {
			id: locals.user.id,
			name: locals.user.name,
			picture: locals.user.picture,
		};
		game.players.push({ isHost: false, kicked: false, user });
		ablyServer.channels.get(`lobby:${gameId}`).publish("join", user).then();
	} else if (self.kicked) error(403, "You've been kicked from this game!");

	return {
		players: game.players
			.filter((player) => !player.kicked)
			.map((player) => {
				return {
					isHost: player.isHost,
					...player.user,
				};
			}),
	};
};

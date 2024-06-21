import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";
import ablyServer from "$lib/server/ably-server";

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
		(player) => player.user.id == locals.user.id,
	)[0];
	if (!self) {
		// The user is not in this game yet, so add them
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
		// Add player in realtime
		ablyServer.channels
			.get("game:" + gameId + ":lobby")
			.publish("join", user)
			.then();
	} else if (self.kicked) error(403, "You've been kicked from this game!");
	return {
		userId: locals.user.id,
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

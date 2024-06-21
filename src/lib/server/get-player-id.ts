import prisma from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";
import ablyServer from "$lib/server/ably-server";

async function addPlayer(
	gameId: number,
	user: { id: number; schoolId: number },
) {
	const game = await prisma.game.findFirst({
		where: {
			id: gameId,
			map: { creator: { schoolId: user.schoolId } },
			state: { not: "ENDED" },
		},
		select: { mapId: true, state: true },
	});
	if (!game) error(403, "You do not have access to this game!");
	if (game.state == "LOBBY") redirect(303, "/game/" + gameId + "/lobby/");

	const spawnpoint = await chooseSpawnpoint(game.mapId);
	const newPlayer = await prisma.player.create({
		data: { userId: user.id, gameId, currRoomId: spawnpoint },
		select: {
			id: true,
			currRoom: { select: { svgRef: true } },
			user: { select: { name: true, picture: true } },
			game: {
				select: {
					state: true,
					claimedRooms: { where: { roomId: spawnpoint } },
				},
			},
		},
	});
	if (newPlayer.game.claimedRooms.length == 0) {
		await prisma.claimedRoom.create({
			data: { gameId, roomId: spawnpoint },
		});
	}

	// Initialize the player's realtime map position
	ablyServer.channels
		.get("game:" + gameId + ":positions")
		.publish("create", {
			userId: user.id,
			picture: newPlayer.user.picture,
			svgRef: newPlayer.currRoom.svgRef,
		})
		.then();
	// Initialize the player's realtime points (for the leaderboard)
	ablyServer.channels
		.get("game:" + gameId + ":points")
		.publish("create", { userId: user.id, name: newPlayer.user.name })
		.then();

	return newPlayer.id;
}

export default async function getPlayerId(
	user: { id: number; schoolId: number },
	gameId: number,
): Promise<number> {
	const player = await prisma.player.findFirst({
		where: { userId: user.id, gameId },
		select: {
			id: true,
			game: { select: { state: true } },
			kicked: true,
		},
	});
	if (player) {
		if (player.kicked) error(403, "You've been kicked from this game!");
		/* eslint-disable no-fallthrough */
		switch (player.game.state) {
			case "LOBBY":
				redirect(303, "/game/" + gameId + "/lobby/");
			case "ONGOING":
				return player.id;
			case "ENDED":
				redirect(301, "/game/" + gameId + "/end/");
		}
		/* eslint-enable no-fallthrough */
	}
	// The player does not exist yet, so add them
	return await addPlayer(gameId, user);
}

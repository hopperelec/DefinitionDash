import prisma from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import ablyServer from "$lib/server/ably-server";

async function startGame(gameId: number) {
	// Start the game in the database
	await prisma.game.update({
		where: { id: gameId },
		data: { state: "ONGOING" },
	});
	// Start the game in realtime
	ablyServer.channels
		.get("game:" + gameId + ":lobby")
		.publish("start", null)
		.then();
}

export const GET = async ({ params, locals }) => {
	// Ensure the player is allowed to start the game
	const gameId = +params.gameId;
	const player = await prisma.player.findUnique({
		where: { userId_gameId: { userId: locals.user.id, gameId } },
		select: {
			isHost: true,
			game: { select: { state: true } },
		},
	});
	if (!player) error(403, "You are not in this game!");
	if (player.game.state != "LOBBY")
		error(403, "This game has already started!");
	if (!player.isHost) error(403, "Only the game's host can start it!");

	await startGame(gameId);
	// Redirect the host to the started game
	redirect(301, "/game/" + gameId + "/");
};

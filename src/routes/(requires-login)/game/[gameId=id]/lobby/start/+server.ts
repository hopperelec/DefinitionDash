import ablyServer from "$lib/server/ably-server";
import prisma from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";

async function startGame(gameId: number) {
	await prisma.game.update({
		where: { id: gameId },
		data: { state: "ONGOING" },
	});
	ablyServer.channels.get(`game:${gameId}:lobby`).publish("start", null).then();
}

export const GET = async ({ params, locals }) => {
	const gameId = +params.gameId;
	const player = await prisma.player.findUnique({
		where: { userId_gameId: { userId: locals.user.id, gameId } },
		select: {
			isHost: true,
			game: { select: { state: true } },
		},
	});
	if (!player) error(403, "You are not in this game!");
	if (player.game.state !== "LOBBY")
		error(403, "This game has already started!");
	if (!player.isHost) error(403, "Only the game's host can start it!");
	await startGame(gameId);
	redirect(301, `/game/${gameId}/`);
};

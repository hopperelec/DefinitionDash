import prisma from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import ablyServer from "$lib/server/ably-server";

async function assignHost(gameId: number, userId: number) {
	// Assign as a host in the database
	await prisma.player.update({
		where: { userId_gameId: { userId, gameId } },
		data: { isHost: true },
	});
	// Assign as a host in realtime
	ablyServer.channels
		.get("game:" + gameId + ":lobby")
		.publish("host", { userId })
		.then();
}

export const GET = async ({ params, locals }) => {
	const gameId = +params.gameId;
	const player = await prisma.player.findUnique({
		where: {
			userId_gameId: { userId: locals.user.id, gameId },
			kicked: false,
		},
		select: {
			isHost: true,
			game: {
				select: {
					state: true,
					players: {
						where: { userId: { not: locals.user.id } },
						select: { userId: true, isHost: true },
					},
				},
			},
		},
	});
	if (!player) error(403, "You are not in this game!");
	if (player.game.state != "LOBBY")
		error(403, "You can only leave a game whilst it is in the lobby!");
	// Remove player in the database
	await prisma.player.delete({
		where: { userId_gameId: { userId: locals.user.id, gameId } },
	});
	// Remove player in realtime
	ablyServer.channels
		.get("game:" + gameId + ":lobby")
		.publish("leave", { userId: locals.user.id })
		.then();
	if (
		player.game.players.length != 0 && // there are other players
		!player.game.players.some((player) => player.isHost) // none of those players are a host
	)
		await assignHost(gameId, player.game.players[0].userId);
	// Redirect to home page
	redirect(302, "/");
};

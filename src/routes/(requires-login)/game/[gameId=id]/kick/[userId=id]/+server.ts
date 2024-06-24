import ablyServer from "$lib/server/ably-server";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const POST = async ({ locals, params }) => {
	const requestedUserId = +params.userId;
	if (requestedUserId === locals.user.id)
		error(403, "You can't kick yourself!");

	// Ensure the requesting player can kick other players
	const gameId = +params.gameId;
	const requestingPlayer = await prisma.player.findUnique({
		where: {
			userId_gameId: { userId: locals.user.id, gameId },
			isHost: true,
		},
		select: { game: { select: { state: true } } },
	});
	if (!requestingPlayer) error(403, "You are not a host of this game!");
	if (requestingPlayer.game.state === "ENDED")
		error(403, "You can't kick a player after the game has ended!");

	// Ensure the requested player can be kicked
	const requestedPlayer = await prisma.player.findUnique({
		where: { userId_gameId: { userId: requestedUserId, gameId } },
		select: { isHost: true, kicked: true },
	});
	if (!requestedPlayer) error(403, "This user isn't in your game!");
	if (requestedPlayer.isHost) error(403, "You can't kick a host!");
	if (requestedPlayer.kicked) error(403, "This player is already kicked");

	await prisma.player.update({
		where: { userId_gameId: { userId: requestedUserId, gameId } },
		data: { kicked: true },
		select: { id: true },
	});
	ablyServer.channels
		.get(`game:${gameId}:announcements`)
		.publish("kick", { userId: requestedUserId })
		.then();
	return new Response();
};

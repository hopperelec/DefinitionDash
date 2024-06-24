import ablyServer from "$lib/server/ably-server";
import prisma from "$lib/server/prisma";
import { error, json } from "@sveltejs/kit";

// Authenticates a user with Ably by returning a "token request" which the
// client can use to request an Ably token via the Ably API
export const GET = async ({ locals }) => {
	const userData = await prisma.user.findUnique({
		where: { id: locals.user.id },
		include: {
			players: { select: { id: true, gameId: true } },
		},
	});
	if (!userData)
		error(
			500,
			"An unexpected error occurred while trying to retrieve your user data",
		);
	const channels = [`player:*:${locals.user.id}`];
	for (const player of userData.players) {
		channels.push(`game:${player.gameId}:*`);
	}
	return json(
		await ablyServer.auth.createTokenRequest({
			capability: channels.reduce(
				(acc, channel) => {
					acc[channel] = ["subscribe"];
					return acc;
				},
				{} as { [key: string]: ["subscribe"] },
			),
		}),
	);
};

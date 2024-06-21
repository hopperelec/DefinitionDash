import prisma from "$lib/server/prisma";
import getAnyMapFor from "$lib/server/get-any-map-for";
import { redirect } from "@sveltejs/kit";
import chooseSpawnpoint from "$lib/server/choose-spawnpoint";

// Creates a new game+player and redirects the user to it
export const GET = async ({ locals }) => {
	const map = await getAnyMapFor(locals.user.schoolId);
	const spawnpoint = await chooseSpawnpoint(map.id);
	const player = await prisma.player.create({
		data: {
			user: { connect: { id: locals.user.id } },
			game: {
				create: {
					mapId: map.id,
					claimedRooms: {
						create: {
							room: { connect: { id: spawnpoint } },
						},
					},
				},
			},
			currRoom: { connect: { id: spawnpoint } },
			isHost: true,
		},
		select: { gameId: true },
	});
	redirect(302, "/game/" + player.gameId + "/");
};

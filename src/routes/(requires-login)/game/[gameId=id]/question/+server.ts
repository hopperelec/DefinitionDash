import prisma from "$lib/server/prisma";
import type { Definition } from "$lib/types";
import { error, json } from "@sveltejs/kit";

export const GET = async ({ params, locals, url }) => {
	const roomRequested = url.searchParams.get("svgRef");
	if (!roomRequested) error(400, "You must select a room you wish to move to");

	const player = await prisma.player.findUnique({
		where: {
			userId_gameId: { userId: locals.user.id, gameId: +params.gameId },
			game: { state: "ONGOING" },
			kicked: false,
		},
		select: {
			id: true,
			currRoom: { select: { svgRef: true } },
			currQuestion: {
				select: {
					wordClass: true,
					definition: true,
					usageTemplate: true,
				},
			},
			game: { select: { mapId: true } },
		},
	});
	if (!player)
		error(403, "You are not in this game or the game is not ongoing!");
	if (player.currQuestion) return json(player.currQuestion);

	// Ensure there is a door between the room the player is currently in and the room they are trying to move to
	const door = await prisma.door.findUnique({
		where: {
			mapId_svgRef1_svgRef2: {
				mapId: player.game.mapId,
				svgRef1: Math.min(player.currRoom.svgRef, +roomRequested),
				svgRef2: Math.max(player.currRoom.svgRef, +roomRequested),
			},
		},
		select: { id: true },
	});
	if (!door)
		error(
			400,
			"There is no door between the room you are currently in and the room you selected!",
		);

	const definitions: ({ id: bigint } & Definition)[] = await prisma.$queryRaw`
				SELECT id,wordClass,definition,usageTemplate
				FROM Definition
				ORDER BY rand()
				LIMIT 1`;
	if (definitions.length === 0) error(500, "No questions have been defined!");
	const { id: definitionId, ...definition } = definitions[0];
	await prisma.player.update({
		where: { id: player.id },
		data: {
			currQuestionId: Number(definitionId),
			currMoveId: +roomRequested,
		},
	});
	return json(definition);
};

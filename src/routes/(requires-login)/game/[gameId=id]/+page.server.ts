import getPlayerId from "$lib/server/get-player-id";
import prisma from "$lib/server/prisma";
import type { Definition } from "$lib/types";
import type { ShopItem } from "@prisma/client";
import { error } from "@sveltejs/kit";

type Opponents = {
	[key: number]: {
		name: string | null;
		picture: string | null;
		currSvgRef: number;
		points: number;
		isHost: boolean;
	};
};

export const load = async ({ params, locals }) => {
	const playerId = await getPlayerId(locals.user, +params.gameId);
	const ret = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			currQuestion: {
				select: {
					wordClass: true,
					definition: true,
					usageTemplate: true,
				},
			},
			currMove: {
				select: {
					svgRef: true,
				},
			},
			game: {
				select: {
					map: { select: { id: true, imgURL: true } },
					players: {
						where: { kicked: false },
						select: {
							user: { select: { id: true, name: true, picture: true } },
							currRoom: { select: { svgRef: true } },
							points: true,
							isHost: true,
						},
					},
					claimedRooms: {
						select: {
							room: { select: { svgRef: true } },
						},
					},
				},
			},
		},
	});
	if (!ret)
		error(
			500,
			"An unexpected error occurred while trying to retrieve your player data",
		);

	const props: {
		players: Opponents;
		map: { id: number; imgURL: string };
		claimedRooms: Set<number>;
		shopItems: ShopItem[];
		currQuestion: Definition | null;
		currMove?: number;
	} = {
		players: ret.game.players.reduce((acc, player) => {
			acc[player.user.id] = {
				name: player.user.name,
				picture: player.user.picture,
				currSvgRef: player.currRoom.svgRef,
				points: player.points,
				isHost: player.isHost,
			};
			return acc;
		}, {} as Opponents),
		map: ret.game.map,
		claimedRooms: new Set(
			ret.game.claimedRooms.map((claimedRoom) => claimedRoom.room.svgRef),
		),
		shopItems: await prisma.shopItem.findMany(),
		currQuestion: ret.currQuestion,
		currMove: ret.currMove?.svgRef,
	};
	return props;
};

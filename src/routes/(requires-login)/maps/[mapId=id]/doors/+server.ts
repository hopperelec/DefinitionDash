import encodeDoors from "$lib/server/encode-doors";
import prisma from "$lib/server/prisma";
import type { Config } from "@sveltejs/adapter-vercel";
import { error } from "@sveltejs/kit";

export const config: Config = {
	isr: {
		expiration: 60,
	},
};

export const GET = async ({ params, locals }) => {
	const map = await prisma.map.findFirst({
		where: {
			id: +params.mapId,
			creator: { schoolId: locals.user.schoolId },
		},
		select: {
			doors: { select: { svgRef1: true, svgRef2: true } },
		},
	});
	if (!map) error(403, "You do not have access to a game with this ID!");
	return new Response(encodeDoors(map.doors));
};

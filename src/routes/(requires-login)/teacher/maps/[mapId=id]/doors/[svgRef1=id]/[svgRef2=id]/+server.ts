import getMap from "$lib/server/get-map";
import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const PUT = async ({ params, locals }) => {
	const map = await getMap(locals.user.schoolId, +params.mapId);
	if (params.svgRef1 === params.svgRef2)
		error(400, "Cannot add a door between a room and itself!");
	const svgRef1 = +params.svgRef1;
	const svgRef2 = +params.svgRef2;
	await prisma.door.create({
		data: {
			mapId: map.id,
			svgRef1: Math.min(svgRef1, svgRef2),
			svgRef2: Math.max(svgRef1, svgRef2),
		},
	});
	return new Response(null, { status: 201 });
};

export const DELETE = async ({ params, locals }) => {
	const door = {
		mapId: +params.mapId,
		svgRef1: +params.svgRef1,
		svgRef2: +params.svgRef2,
	};
	await getMap(locals.user.schoolId, door.mapId);
	await prisma.door.delete({
		where: { mapId_svgRef1_svgRef2: door },
	});
	return new Response();
};

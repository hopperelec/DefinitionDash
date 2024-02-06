import { error } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import getMap from "$lib/server/get-map";

export const PUT = async ({ params, locals }) => {
  const map = await getMap(locals.user.schoolId, +params.mapId);
  if (params.svgRef1Id === params.svgRef2Id)
    throw error(400, "Cannot add a door between a room and itself!");
  const svgRef1Id = +params.svgRef1Id;
  const svgRef2Id = +params.svgRef2Id;
  await prisma.door.create({
    data: {
      map: {
        connect: {
          id: map.id,
        },
      },
      svgRef1: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.min(svgRef1Id, svgRef2Id),
            mapId: map.id,
          },
        },
      },
      svgRef2: {
        connect: {
          mapId_svgRef: {
            svgRef: Math.max(svgRef1Id, svgRef2Id),
            mapId: map.id,
          },
        },
      },
    },
  });
  return new Response();
};

export const DELETE = async ({ params, locals }) => {
  const door = {
    mapId: +params.mapId,
    svgRef1Id: +params.svgRef1Id,
    svgRef2Id: +params.svgRef2Id,
  };
  await getMap(locals.user.schoolId, door.mapId);
  await prisma.door.delete({
    where: {
      mapId_svgRef1Id_svgRef2Id: door,
    },
  });
  return new Response();
};

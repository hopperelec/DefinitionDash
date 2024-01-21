import type { LayoutServerLoad } from "./$types";
import type { User } from "@prisma/client";
import { getMapFor } from "$lib/get-map-for";
import prisma from "$lib/prisma";

type Map = {
  id: number;
  data: string;
  doors: { room1_id: number; room2_id: number }[];
};
type Props = {
  user: User;
  map?: Map;
};
export const load: LayoutServerLoad = async ({ locals }) => {
  const data: Props = {
    user: locals.user,
  };
  const map = await getMapFor(locals.user);
  if (map) {
    data.map = {
      id: map.id,
      data: await (await fetch(map.img_url)).text(),
      doors: await prisma.door.findMany({
        where: {
          map_id: map.id,
        },
        select: {
          room1_id: true,
          room2_id: true,
        },
      }),
    };
  }
  return data;
};

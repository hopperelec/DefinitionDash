import type { LayoutServerLoad } from "./$types";
import type { User } from "@prisma/client";
import { getMapFor } from "$lib/get-map-for";
import prisma from "$lib/prisma";
import type { DefinitionDashMap } from "$lib/types";

type Props = {
  user: User;
  map?: DefinitionDashMap;
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

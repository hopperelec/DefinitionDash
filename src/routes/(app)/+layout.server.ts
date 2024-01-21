import type { LayoutServerLoad } from "./$types";
import type { User } from "@prisma/client";
import { getMapFor } from "$lib/get-map-for";

type props = {
  user: User;
  map_id?: number;
  map?: string;
};
export const load: LayoutServerLoad = async ({ locals }) => {
  const data: props = {
    user: locals.user,
  };
  const map = await getMapFor(locals.user);
  if (map) {
    data.map_id = map.id;
    data.map = await (await fetch(map.img_url)).text();
  }
  return data;
};

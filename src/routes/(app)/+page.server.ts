import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const data = await parent();
  const map = await prisma.map.findFirst({
    where: {
      creator: {
        school_id: data.user.school_id,
      },
    },
  });
  if (map) {
    return {
      map: await (await fetch(map.img_url)).text(),
    };
  }
};

import { error, redirect } from "@sveltejs/kit";
import getAnyMapFor from "$lib/server/get-any-map-for";

export const GET = async ({ locals }) => {
  const map = await getAnyMapFor(locals.user.schoolId);
  if (!map) error(403, "You do not have access to any maps!");
  redirect(302, "/teacher/maps/" + map.id);
};

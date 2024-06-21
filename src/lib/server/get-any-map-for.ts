import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

// Returns a map created by a user from the given school.
// There could be many valid maps, but only one is returned;
// which map is returned is essentially arbitrary.
export default async function getAnyMapFor(schoolId: number) {
	const map: { id: number } | null = await prisma.map.findFirst({
		where: { creator: { schoolId } },
		select: { id: true },
	});
	if (map) return map;
	error(403, "You do not have access to any maps!");
}

import prisma from "$lib/prisma";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const definition: { id: bigint; definition: string }[] =
    await prisma.$queryRaw`SELECT id,definition FROM Definition ORDER BY rand() LIMIT 1`;
  return new Response(
    JSON.stringify(definition[0], (_, v) =>
      typeof v === "bigint" ? Number(v) : v,
    ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

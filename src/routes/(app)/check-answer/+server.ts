import { error, type RequestHandler } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) throw error(400, "Question ID not provided");
  const answer = url.searchParams.get("answer");
  if (!answer) throw error(400, "Answer not provided");
  const res = await prisma.definition.findUnique({
    where: {
      id: +id,
    },
    select: {
      answer_regex: true,
    },
  });
  if (!res) throw error(400, "Invalid question ID");
  const correct = new RegExp("^" + res.answer_regex + "$").test(answer);
  return new Response(JSON.stringify({ correct }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

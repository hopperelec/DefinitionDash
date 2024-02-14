import { type Callback, getGameEventEmitter } from "$lib/server/events";
import type { Config } from "@sveltejs/adapter-vercel";

export const config: Config = {
  runtime: "edge",
};

export const GET = ({ params, locals }) => {
  const eventEmitter = getGameEventEmitter(+params.gameId);
  let callback: Callback;
  eventEmitter.emitEvent(
    "connect",
    locals.user.name || "User " + locals.user.id,
  );
  return new Response(
    new ReadableStream({
      start(controller) {
        callback = (name, data) => {
          controller.enqueue(`event: ${name}`);
          if (data) controller.enqueue(`\ndata: ${data}`);
          controller.enqueue("\n\n");
        };
        eventEmitter.listeners.add(callback);
      },
      cancel() {
        eventEmitter.listeners.delete(callback);
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
      },
    },
  );
};

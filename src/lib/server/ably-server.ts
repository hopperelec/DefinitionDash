import ably from "ably";
import { ABLY_API_KEY } from "$env/static/private";

const ablyServer = new ably.Realtime.Promise({ key: ABLY_API_KEY });
export default ablyServer;

export async function updateRealtimePoints(
  gameId: number,
  userId: number,
  points: number,
) {
  await ablyServer.channels
    .get("player:" + gameId + ":" + userId)
    .publish("points", { points: points });
  await ablyServer.channels
    .get("game:" + gameId + ":points")
    .publish("points", { userId, points });
}

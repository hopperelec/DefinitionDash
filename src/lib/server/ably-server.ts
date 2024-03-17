import ably from "ably";
import { ABLY_API_KEY } from "$env/static/private";

const ablyServer = new ably.Realtime({ key: ABLY_API_KEY });
export default ablyServer;

export function updateRealtimePoints(
  gameId: number,
  userId: number,
  points: number,
) {
  ablyServer.channels
    .get("player:" + gameId + ":" + userId)
    .publish("points", { points: points });
  ablyServer.channels
    .get("game:" + gameId + ":points")
    .publish("points", { userId, points });
}

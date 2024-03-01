import ably from "ably";

export function getAblyClient() {
  return new ably.Realtime.Promise({ authUrl: "/ably-auth" });
}

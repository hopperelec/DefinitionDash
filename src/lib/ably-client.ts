import ably from "ably";
import { type Readable, readable } from "svelte/store";
import { browser } from "$app/environment";

export const ablyClientConnection =
  browser && new ably.Realtime({ authUrl: "/ably-auth" });

const messages: { [key: string]: Readable<ably.Types.Message> } = {};

export function getChannel(name: string) {
  if (!ablyClientConnection) return readable(undefined);
  if (name in messages) return messages[name];
  const ablyChannel = ablyClientConnection.channels.get(name);
  const message = readable<ably.Types.Message>(undefined, (set) => {
    ablyChannel.subscribe(set);
    return () => {
      ablyChannel.detach();
      ablyChannel.unsubscribe(set);
      delete messages[name];
    };
  });
  messages[name] = message;
  return message;
}

import ably from "ably";
import { type Readable, readable } from "svelte/store";
import { browser } from "$app/environment";

export const ablyClientConnection =
  browser && new ably.Realtime.Promise({ authUrl: "/ably-auth" });

const channels: {
  [key: string]: {
    ablyPromise: ably.Types.RealtimeChannelPromise;
    svelteStore: Readable<ably.Types.Message>;
  };
} = {};

export function getChannel(name: string) {
  if (!ablyClientConnection) return readable(undefined);
  if (name in channels) {
    const channel = channels[name];
    if (channel.ablyPromise.state != "attached")
      channel.ablyPromise.attach().then();
    return channel.svelteStore;
  }
  const ablyPromise = ablyClientConnection.channels.get(name);
  const svelteStore = readable<ably.Types.Message>(undefined, (set) => {
    ablyPromise.subscribe(set).then();
    return async () => {
      await ablyPromise.detach();
    };
  });
  channels[name] = { ablyPromise, svelteStore };
  return svelteStore;
}

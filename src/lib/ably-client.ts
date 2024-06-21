import ably from "ably";
import { type Readable, readable } from "svelte/store";
import { browser } from "$app/environment";

export const ablyClientConnection =
	browser && new ably.Realtime({ authUrl: "/ably-auth" });

const messages: { [key: string]: Readable<ably.InboundMessage> } = {};

export function getChannel(name: string) {
	if (!ablyClientConnection) return readable(undefined);
	if (name in messages) return messages[name];
	const ablyChannel = ablyClientConnection.channels.get(name);
	const message = readable<ably.InboundMessage>(undefined, (set) => {
		ablyChannel.subscribe(set).then();
		return () => {
			ablyChannel.detach().then();
			ablyChannel.unsubscribe(set);
			delete messages[name];
		};
	});
	messages[name] = message;
	return message;
}

import ably from "ably";
import { type Writable, writable } from "svelte/store";

export default writable() as Writable<ably.Types.RealtimePromise>;

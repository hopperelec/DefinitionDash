import ably from "ably";
import { ABLY_API_KEY } from "$env/static/private";

export default new ably.Realtime.Promise({ key: ABLY_API_KEY });

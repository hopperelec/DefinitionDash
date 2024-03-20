import { toBuffer } from "uuid-buffer";

export default (uuid: string) => new TextDecoder().decode(toBuffer(uuid));

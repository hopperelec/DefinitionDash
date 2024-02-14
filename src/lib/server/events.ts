export type Callback = (name: string, data?: string) => void;

export class GameEventEmitter {
  listeners = new Set<Callback>();

  public emitEvent(name: string, data?: string) {
    for (const callback of this.listeners) callback(name, data);
  }
}

const eventEmitters: { [key: number]: GameEventEmitter } = {};

export function getGameEventEmitter(gameId: number) {
  if (gameId in eventEmitters) return eventEmitters[gameId];
  const eventEmitter = new GameEventEmitter();
  eventEmitters[gameId] = eventEmitter;
  return eventEmitter;
}

export type Question = { id: number; question: string };
export type LocalDoor = { room1Id: number; room2Id: number };
export type DefinitionDashMap = {
  id: number;
  data: string;
  doors: LocalDoor[];
};

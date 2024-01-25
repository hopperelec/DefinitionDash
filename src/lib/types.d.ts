export type Question = { id: number; question: string };
export type LocalDoor = { room1_id: number; room2_id: number };
export type DefinitionDashMap = {
  id: number;
  data: string;
  doors: LocalDoor[];
};

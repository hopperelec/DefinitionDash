export type Question = { id: number; question: string };
export type LocalDoor = { svgRef1Id: number; svgRef2Id: number };
export type DefinitionDashMap = {
  id: number;
  data: string;
  doors: LocalDoor[];
};

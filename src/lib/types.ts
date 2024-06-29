export type LocalDoor = { svgRef1: number; svgRef2: number };

export type Doors = { [key: number]: Set<number> };

export type Definition = {
	wordClass: string | null;
	definition: string;
	usageTemplate: string | null;
};

import type { LocalDoor } from "$lib/types";

function getMaxNumericKey(obj: { [key: number]: unknown }) {
	return +Object.keys(obj).reduce((a, b) => (+a > +b ? a : b));
}

function calcBitsNeededToStore(value: number) {
	return Math.ceil(Math.log2(value + 1));
}

function* flattenOneToMany(oneToMany: { [key: number]: number[] }) {
	const entries = Object.entries(oneToMany);
	for (let i = 0; i < entries.length; i++) {
		yield +entries[i][0];
		yield* entries[i][1];
		if (i !== entries.length - 1) yield 0;
	}
}

function numbersToBytes(numbers: number[], bitsPerNumber: number) {
	const bytes = Buffer.alloc(
		Math.ceil((numbers.length * bitsPerNumber) / 8) + 1,
	);
	bytes[0] = bitsPerNumber;
	let byteIndex = 1;
	let bitIndex = 0;
	for (const number of numbers) {
		for (let i = bitsPerNumber - 1; i >= 0; i--) {
			const bit = (number >> i) & 1;
			bytes[byteIndex] |= bit << bitIndex; // Little endian
			if (++bitIndex === 8) {
				bitIndex = 0;
				byteIndex++;
			}
		}
	}
	return bytes;
}

export default function encodeDoors(doors: LocalDoor[]) {
	const svgRefCounts: { [key: number]: number } = {};
	for (const { svgRef1, svgRef2 } of doors) {
		svgRefCounts[svgRef1] = (svgRefCounts[svgRef1] || 0) + 1;
		svgRefCounts[svgRef2] = (svgRefCounts[svgRef2] || 0) + 1;
	}
	const oneToManyDoors: { [key: number]: number[] } = {};
	for (let { svgRef1, svgRef2 } of doors) {
		if (svgRefCounts[svgRef1] < svgRefCounts[svgRef2])
			[svgRef1, svgRef2] = [svgRef2, svgRef1];
		if (oneToManyDoors[svgRef1]) oneToManyDoors[svgRef1].push(svgRef2);
		else oneToManyDoors[svgRef1] = [svgRef2];
	}
	return numbersToBytes(
		[...flattenOneToMany(oneToManyDoors)],
		calcBitsNeededToStore(getMaxNumericKey(svgRefCounts)),
	);
}

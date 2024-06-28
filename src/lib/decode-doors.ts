import type { Doors } from "$lib/types";

export default function decodeDoors(buffer: ArrayBuffer) {
	const doors: Doors = {};
	const bytes = new Uint8Array(buffer);
	const bitsPerSvgRef = bytes[0];
	let firstSvgRef = 0;
	let isFirstSvgRef = true;
	let byteIndex = 1;
	let bitIndex = 0;
	while (byteIndex < bytes.length) {
		let currentNumber = 0;
		for (let i = bitsPerSvgRef - 1; i >= 0; i--) {
			const bit = (bytes[byteIndex] >> bitIndex) & 1;
			currentNumber |= bit << i; // Little endian
			if (++bitIndex === 8) {
				bitIndex = 0;
				byteIndex++;
			}
		}
		if (currentNumber === 0) {
			isFirstSvgRef = true;
		} else if (isFirstSvgRef) {
			firstSvgRef = currentNumber;
			isFirstSvgRef = false;
		} else {
			const svgRef1 = Math.min(firstSvgRef, currentNumber);
			const svgRef2 = Math.max(firstSvgRef, currentNumber);
			doors[svgRef1] = doors[svgRef1] || new Set();
			doors[svgRef1].add(svgRef2);
		}
	}
	return doors;
}

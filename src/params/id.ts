export const match = (param) => {
  // Matches all natural numbers
  return /^[1-9]\d*$/.test(param);
};

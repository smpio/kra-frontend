export function sum (array: number[]): number {
  return array.reduce((a, b) => a + b);
}

export function mean (array: number[]): number {
  return sum(array) / array.length;
}

export function stdDev (array: number[]): number {
  let m = mean(array);
  return Math.sqrt(sum(array.map(x => (x-m) * (x-m))) / array.length);
}

export function max (array: number[]): number {
  return array.reduce((a, b) => a > b ? a : b);
}

export function min (array: number[]): number {
  return array.reduce((a, b) => a < b ? a : b);
}

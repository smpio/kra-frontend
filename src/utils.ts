export function parseDate(date: string): Date;
export function parseDate(date: string|null): Date|null;
export function parseDate(date: string|null): Date|null {
  if (date === null) {
    return date;
  }
  return new Date(date + 'Z');
}

export function* chain<T>(...iterables: Iterable<T>[]): Iterable<T> {
  for (let iterable of iterables) {
    for (let item of iterable) {
      yield item;
    }
  }
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

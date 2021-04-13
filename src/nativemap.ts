import { MutableOrderedMap } from './interface';
import bigInt, { BigInteger } from 'big-integer';

function sortBigInt(a: BigInteger, b: BigInteger) {
  if (a.lt(b)) {
    return 1;
  } else if (a.eq(b)) {
    return 0;
  } else {
    return -1;
  }
}

export default class BigIntOrderedMap<V> implements MutableOrderedMap<V> {
  private root = new Map<string, V>();

  constructor() {}

  get(key: BigInteger) {
    return this.root.get(key.toString()) ?? null;
  }

  set(key: BigInteger, value: V) {
    this.root.set(key.toString(), value);
  }

  clear() {
    this.root = new Map();
  }

  has(key: BigInteger) {
    return this.root.has(key.toString());
  }

  delete(key: BigInteger) {
    return this.root.delete(key.toString());
  }

  [Symbol.iterator](): IterableIterator<[BigInteger, V]> {
    const result = Array.from(this.root)
      .map(([key, value]) => {
        const num = bigInt(key);
        return [num, value] as [BigInteger, V];
      })
      .sort(([a], [b]) => sortBigInt(a,b));
    let idx = 0;
    return {
      [Symbol.iterator]: this[Symbol.iterator],
      next: (): IteratorResult<[BigInteger, V]> => {
        if (idx < result.length) {
          return { value: result[idx++], done: false };
        }
        return { done: true, value: null };
      },
    };
  }

  peekLargest() {
    const sorted = Array.from(this);
    return sorted[0] as [BigInteger, V] | null;
  }

  peekSmallest() {
    const sorted = Array.from(this);
    return sorted[sorted.length - 1] as [BigInteger, V] | null;
  }

  keys() {
    return Array.from(this.root.keys()).map(key => bigInt(key)).sort(sortBigInt);
  }
}

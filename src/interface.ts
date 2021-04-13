import { BigInteger } from "big-integer";

export interface MutableOrderedMap<V> {
  get: (key: BigInteger) => V | null;
  set: (key: BigInteger, value: V) => void;
  clear: () => void;
  has: (key: BigInteger) => boolean;
  delete: (key: BigInteger) => boolean 
  peekLargest: () => [BigInteger, V] | null;
  peekSmallest: () => [BigInteger, V] | null;
  keys: () => BigInteger[];
  [Symbol.iterator]: () => IterableIterator<[BigInteger, V]>;
}

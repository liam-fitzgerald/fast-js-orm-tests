import _ from 'lodash';
import f from 'lodash/fp';
import bigInt, { BigInteger } from 'big-integer';
import CurrentBigIntOrderedMap from '../src/current';
import PojoOrderedMap from '../src/pojo';
import ESOrderedMap from '../src/nativemap';
import { MutableOrderedMap } from '../src/interface';

interface Value {
  numb: number;
  thing: string;
}

const thing = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
`;
type Fixture = [BigInteger, Value];
const makeFixtures = f.flow(
  f.range(0),
  f.map(
    (numb: number): Fixture =>
      [bigInt(numb), { numb, thing: thing.slice() }] as Fixture
  ),
  f.shuffle
);
const [small, med, large] = [10, 100, 1000].map(makeFixtures);

let start = 0;
let results: Record<string, Record<string, number>> = {};
let map: MutableOrderedMap<Value>;
const timeIt = (implementation: string, name: string, fn: () => void) =>
  it(name, () => {
    start = performance.now();
    fn();
    _.set(results, [name, implementation], performance.now() - start);
  });

const testMapImplementation = (
  impName: string,
  imp: () => MutableOrderedMap<Value>
) => {
  describe(impName, () => {
    beforeAll(() => {
      map = imp();
    });
    afterEach(() => {
      map.clear();
    });
    afterAll(() => {});
    const runUpdateFixtures = (
      name: string,
      fixtures: Fixture[],
      sampleKey: BigInteger
    ) => {
      const ref = `${impName}: ${name}:`;
      describe(`updating ${name} fixtures`, () => {
        beforeEach(() => {
          map.clear();
          _.forEach(fixtures, ([key, value]) => {
            map.set(key, value);
          });
        });

        timeIt(ref, 'should have key', () => {
          const doesHave = map.has(sampleKey);
          expect(doesHave).toBeTruthy();
        });

        timeIt(ref, 'should delete key', () => {
          const deleted = map.delete(sampleKey);
          expect(deleted).toBeTruthy();
        });

        timeIt(ref, 'should get key', () => {
          const value = map.get(sampleKey);
          expect(value).toBeTruthy();
        });
        timeIt(ref, 'should be iterable', () => {
          Array.from(map);
        });
        // check speed improvement of memoized sort
        timeIt(ref, 'should be iterable, maybe memoized', () => {
          Array.from(map);
          Array.from(map);
        });

        timeIt(ref, 'should have keys', () => {
          map.keys();
        });
      });
    };

    const runInsertFixtures = (name: string, fixtures: Fixture[]) => {
      describe(`${name} insert fixtures`, () => {
        beforeEach(() => {
          map.clear();
        });
        const ref = `${impName}: ${name}:`;
        timeIt(ref, `should insert`, () => {
          _.forEach(fixtures, ([key, value]) => {
            map.set(key, value);
          });
        });
      });
    };

    runUpdateFixtures('small', small, bigInt(7));
    runUpdateFixtures('med', med, bigInt(70));
    runUpdateFixtures('large', large, bigInt(700));

    runInsertFixtures('small', small);
    runInsertFixtures('med', med);
    runInsertFixtures('large', large);
  });
};

testMapImplementation('Current', () => new CurrentBigIntOrderedMap());
testMapImplementation('POJO', () => new PojoOrderedMap());
testMapImplementation('ESMap', () => new ESOrderedMap());

afterAll(() => {
  console.log(results);
});

// file: sample.ts
import {
	LEXRANK,
	assertIsLexRank,
	between,
	decrement,
	increment,
	isLexRank,
	makeForward,
	makeReverse,
} from './src/lex-rank.js';

import type { LexRank } from './src/lex-rank.js';

// Starting point for incrementing/appending.
console.log('initialMin', LEXRANK.initialMin);
// 'initialMin 1000000000'

// or perhaps start in the middle instead
console.log('mid', LEXRANK.mid);
// 'mid hzzzzzzzzz'

// Starting point for decrementing/prepending.
console.log('initialMax', LEXRANK.initialMax);
// 'initialMax y000000000'

// Leading zeros are required for
// (fixed width 10 digit) core and trailing zeros are allowed
const coreMin = '0000000000';
const coreMax = 'zzzzzzzzzz';

// Type assertion function to narrow type from `string` to `LexRank`:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
assertIsLexRank(coreMin);
assertIsLexRank(coreMax);

// Trailing zeros are not allowed on the
// variable length suffix portion
// Type predicate:
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
console.log('isLexRank', isLexRank(coreMin + '0'));
// 'isLexRank false'

const forward = makeForward();

const list = Array.from({ length: 5 }, (_v: unknown, i: number) => ({
	id: i,
	rank: forward.next().value,
}));

console.table(list);
// ┌─────────┬────┬──────────────┐
// │ (index) │ id │ rank         │
// ├─────────┼────┼──────────────┤
// │ 0       │ 0  │ '1000000000' │
// │ 1       │ 1  │ '1000000008' │
// │ 2       │ 2  │ '100000000g' │
// │ 3       │ 3  │ '100000000o' │
// │ 4       │ 4  │ '100000000w' │
// └─────────┴────┴──────────────┘

// Re-index in reverse
let index = list.length;

for (const rank of makeReverse()) {
	if (index < 1) break;
	index -= 1;
	list[index].rank = rank;
}

console.table(list);

// ┌─────────┬────┬──────────────┐
// │ (index) │ id │ rank         │
// ├─────────┼────┼──────────────┤
// │ 0       │ 0  │ 'xzzzzzzzz4' │
// │ 1       │ 1  │ 'xzzzzzzzzc' │
// │ 2       │ 2  │ 'xzzzzzzzzk' │
// │ 3       │ 3  │ 'xzzzzzzzzs' │
// │ 4       │ 4  │ 'y000000000' │
// └─────────┴────┴──────────────┘

// Re-index forward with `increment`
const forwardInitial = '0zzzzzzzzs';
assertIsLexRank(forwardInitial);
let rank: LexRank = forwardInitial;
for (const item of list) {
	rank = increment(rank);
	item.rank = rank;
}

console.log('Re-indexed with `increment`:');
console.table(list);

// Re-index reverse with `decrement`
rank = LEXRANK.initialMax;
for (let i = list.length - 1; i >= 0; i -= 1, rank = decrement(rank))
	list[i].rank = rank;

console.log('Re-indexed with `decrement`:');
console.table(list);

// `between` without `after` argument increments
console.log('`between` without `after`:', between(LEXRANK.initialMin));
// '`between` without `after`: 1000000008'

// `between` without `before` argument decrements
console.log(
	'`between` without `before`:',
	between(undefined, LEXRANK.initialMax)
);
// '`between` without `before`: xzzzzzzzzs'

// `between` non-adjacent core
const before1 = 'hzzzzzzzzx';
const after1 = 'hzzzzzzzzz';
assertIsLexRank(before1);
assertIsLexRank(after1);
console.log('non-adjacent `between`:', between(before1, after1));
// 'non-adjacent `between`: hzzzzzzzzy'

// `between` adjacent cores results in suffix
const before2 = 'hzzzzzzzzy';
const after2 = 'hzzzzzzzzz';
assertIsLexRank(before2);
assertIsLexRank(after2);
console.log('adjacent `between`:', between(before2, after2));
// 'adjacent `between`: hzzzzzzzzyi'

const rankI = makeForward();
const sample = Array.from(
	{ length: 3 },
	(_v: unknown, _i: number) => rankI.next().value
);

console.log('\nInitial Ranks:');
console.table(sample);

// Initial Ranks:
// ┌─────────┬──────────────┐
// │ (index) │ Values       │
// ├─────────┼──────────────┤
// │ 0       │ '1000000000' │
// │ 1       │ '1000000008' │
// │ 2       │ '100000000g' │
// └─────────┴──────────────┘

for (let i = 0; i < 10; i += 1) {
	const [move, toIndex] = i & 1 ? ['bottom up', 2] : ['top down', 0];
	sample[toIndex] = sample[1];
	sample[1] = between(sample[0], sample[2]);

	console.log(`\n After moving ${move} (${i}):`);
	console.table(sample);
}

// After moving top down (0):
// ┌─────────┬──────────────┐
// │ (index) │ Values       │
// ├─────────┼──────────────┤
// │ 0       │ '1000000008' │
// │ 1       │ '100000000c' │
// │ 2       │ '100000000g' │
// └─────────┴──────────────┘
//
// After moving bottom up (1):
// ┌─────────┬──────────────┐
// │ (index) │ Values       │
// ├─────────┼──────────────┤
// │ 0       │ '1000000008' │
// │ 1       │ '100000000a' │
// │ 2       │ '100000000c' │
// └─────────┴──────────────┘
//
// After moving top down (2):
// ┌─────────┬──────────────┐
// │ (index) │ Values       │
// ├─────────┼──────────────┤
// │ 0       │ '100000000a' │
// │ 1       │ '100000000b' │
// │ 2       │ '100000000c' │
// └─────────┴──────────────┘
//
// After moving bottom up (3):
// ┌─────────┬───────────────┐
// │ (index) │ Values        │
// ├─────────┼───────────────┤
// │ 0       │ '100000000a'  │
// │ 1       │ '100000000ai' │
// │ 2       │ '100000000b'  │
// └─────────┴───────────────┘
//
// After moving top down (4):
// ┌─────────┬───────────────┐
// │ (index) │ Values        │
// ├─────────┼───────────────┤
// │ 0       │ '100000000ai' │
// │ 1       │ '100000000ar' │
// │ 2       │ '100000000b'  │
// └─────────┴───────────────┘
//
// After moving bottom up (5):
// ┌─────────┬───────────────┐
// │ (index) │ Values        │
// ├─────────┼───────────────┤
// │ 0       │ '100000000ai' │
// │ 1       │ '100000000am' │
// │ 2       │ '100000000ar' │
// └─────────┴───────────────┘
//
// After moving top down (6):
// ┌─────────┬───────────────┐
// │ (index) │ Values        │
// ├─────────┼───────────────┤
// │ 0       │ '100000000am' │
// │ 1       │ '100000000ao' │
// │ 2       │ '100000000ar' │
// └─────────┴───────────────┘
//
// After moving bottom up (7):
// ┌─────────┬───────────────┐
// │ (index) │ Values        │
// ├─────────┼───────────────┤
// │ 0       │ '100000000am' │
// │ 1       │ '100000000an' │
// │ 2       │ '100000000ao' │
// └─────────┴───────────────┘
//
// After moving top down (8):
// ┌─────────┬────────────────┐
// │ (index) │ Values         │
// ├─────────┼────────────────┤
// │ 0       │ '100000000an'  │
// │ 1       │ '100000000ani' │
// │ 2       │ '100000000ao'  │
// └─────────┴────────────────┘
//
// After moving bottom up (9):
// ┌─────────┬────────────────┐
// │ (index) │ Values         │
// ├─────────┼────────────────┤
// │ 0       │ '100000000an'  │
// │ 1       │ '100000000an9' │
// │ 2       │ '100000000ani' │
// └─────────┴────────────────┘

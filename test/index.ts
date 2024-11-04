// file: test/rank.ts
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as l from '../src/lex-rank.js';

const lexRank = suite('lex-rank');

lexRank('"isLexRank" accepting valid strings', () => {
	const input = [
		'0000000000',
		'0000000000',
		'0000000000',
		'zzzzzzzzzz',
		'0123456789',
		'abcdefghij',
		'klmnopqrst',
		'uvwxyz0123',
		'zzzzzzzzzzi',
		'zzzzzzzzzz01234567890abcdefghijklmnopqrstuvwxyz',
	];

	for (let i = 0; i < input.length; i += 1) {
		const maybe = input[i];
		if (l.isLexRank(maybe)) continue;

		throw new assert.Assertion({
			message: `"${maybe}" was not recognized as a valid LexRank`,
			operator: 'custom',
			actual: false,
			expects: true,
		});
	}
});

lexRank('"isLexRank" rejecting invalid strings', () => {
	const input = [
		'111111111', // too short
		'000000000A', // no uppercase letters in core
		'00000000000', // no trailing zero on suffix
		'0000000000i0',
		'0000000000A', // no uppercase letter in suffix
	];

	for (let i = 0; i < input.length; i += 1) {
		const maybe = input[i];
		if (!l.isLexRank(maybe)) continue;

		throw new assert.Assertion({
			message: `"${maybe}" was not rejected as invalid`,
			operator: 'custom',
			actual: true,
			expects: false,
		});
	}
});

lexRank('"makeForward" initial default value', () => {
	assert.is(l.makeForward().next().value, '1000000000');
});

lexRank('"makeReverse" initial default value', () => {
	assert.is(l.makeReverse().next().value, 'y000000000');
});

const coreFromLexRank = (rank: string) => parseInt(rank.slice(0, 10), 36);

const TOWARDS_MAX_EXPECT: Array<string> = [
	'zzzzzzzzzm',
	'zzzzzzzzzu',
	'zzzzzzzzzw',
	'zzzzzzzzzx',
	'zzzzzzzzzy',
	'zzzzzzzzzyi',
	'zzzzzzzzzyr',
	'zzzzzzzzzyv',
	'zzzzzzzzzyx',
	'zzzzzzzzzyy',
	'zzzzzzzzzyz',
	'zzzzzzzzzyzi',
] as const;

lexRank('Incrementing towards "max" (iterator)', () => {
	const expect = TOWARDS_MAX_EXPECT;
	const first = expect[0];
	l.assertIsLexRank(first);

	let i = 0;
	for (const rank of l.makeForward(coreFromLexRank(first))) {
		assert.is(rank, expect[i]);
		i += 1;

		// This iterator is never done
		if (i >= expect.length) break;
	}
});

lexRank('Incrementing towards "max" ("increment")', () => {
	const expect = TOWARDS_MAX_EXPECT;
	const first = expect[0];
	l.assertIsLexRank(first);

	for (
		let i = 0, rank = first;
		i < expect.length;
		i += 1, rank = l.increment(rank)
	)
		assert.is(rank, expect[i]);
});

const TOWARDS_MIN_EXPECT: Array<string> = [
	'000000000d',
	'0000000005',
	'0000000002',
	'0000000001',
	'0000000000i',
	'00000000009',
	'00000000004',
	'00000000002',
	'00000000001',
	'00000000000i',
	'000000000009',
	'000000000004',
	'000000000002',
] as const;

lexRank('Decrementing towards "min" (iterator)', () => {
	const expect = TOWARDS_MIN_EXPECT;
	const first = expect[0];
	l.assertIsLexRank(first);

	let i = 0;
	for (const rank of l.makeReverse(coreFromLexRank(first))) {
		assert.is(rank, expect[i]);
		i += 1;

		// This iterator is never done
		if (i >= expect.length) break;
	}
});

lexRank('Decrementing towards "min" ("decrement")', () => {
	const expect = TOWARDS_MIN_EXPECT;
	const first = expect[0];
	l.assertIsLexRank(first);

	for (
		let i = 0, rank = first;
		i < expect.length;
		i += 1, rank = l.decrement(rank)
	)
		assert.is(rank, expect[i]);
});

lexRank('"between" on adjacent cores', () => {
	const before = 'hzzzzzzzzy';
	const after = 'hzzzzzzzzz';
	l.assertIsLexRank(before);
	l.assertIsLexRank(after);

	const actual = l.between(before, after);
	assert.is(actual, 'hzzzzzzzzyi');
});

lexRank('"between" on non-adjacent cores', () => {
	const before = 'hzzzzzzzzx';
	const after = 'hzzzzzzzzz';
	l.assertIsLexRank(before);
	l.assertIsLexRank(after);

	const actual = l.between(before, after);
	assert.is(actual, 'hzzzzzzzzy');
});

lexRank('"between" on identical cores with suffixes', () => {
	const before = 'hzzzzzzzzzi';
	const after = 'hzzzzzzzzzz';
	l.assertIsLexRank(before);
	l.assertIsLexRank(after);

	const actual = l.between(before, after);
	assert.is(actual, 'hzzzzzzzzzq');
});

lexRank('"between" without "after" argument increments', () => {
	const actual = l.between(l.LEXRANK.initialMin);
	assert.is(actual, '1000000008');
});

lexRank('"between" without "before" argument decrements', () => {
	const actual = l.between(undefined, l.LEXRANK.initialMax);
	assert.is(actual, 'xzzzzzzzzs');
});

lexRank('"between" without "LexRank" arguments returns "LEXRANK.mid"', () => {
	const actual = l.between(undefined);
	assert.is(actual, l.LEXRANK.mid);
});

const isOrderedTriplet = (t: readonly [string, string, string]) =>
	t[0] < t[1] && t[1] < t[2];

lexRank('"between" stress', () => {
	// head - "move `actual[0]`" between `actual[1]` (becoming `actual[0]`) and `actual[2]`
	//    replacing `actual[1]` with a new "between" value
	// !head - "move `actual[2]`" between `actual[0]` and `actual[1]` (becoming `actual[2]`)
	//    replacing `actual[1]` with a new "between" value
	let head = false;
	const actual: [l.LexRank, l.LexRank, l.LexRank] = [
		l.LEXRANK.initialMin,
		l.LEXRANK.mid,
		l.LEXRANK.initialMax,
	];

	const makeError = (i: number) => {
		const expects = actual.slice().sort() as unknown as readonly [
			string,
			string,
			string,
		];
		const position = head ? 'head' : 'tail';
		const message = `"${actual[1]}" is NOT between "${actual[0]}" and "${actual[2]}" after being moved from the ${position} on \`i = ${i}\`.`;

		return new assert.Assertion({
			message,
			operator: 'custom',
			actual,
			expects,
		});
	};

	for (let i = 0; i < 100; i += 1) {
		// New before/after values
		actual[head ? 0 : 2] = actual[1];
		// New middle value
		actual[1] = l.between(actual[0], actual[2])!;
		if (!isOrderedTriplet(actual)) throw makeError(i);

		head = !head;
	}
	// console.log(`[${actual[0]}, ${actual[1]}, ${actual[2]}]`, head);
});

lexRank.run();

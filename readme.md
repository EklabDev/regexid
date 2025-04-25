# 📦 regexid

A deterministic, lexicographic regex match generator for fixed-length patterns.
Supports literal + ranged character sets like `[a-z]{2}, [0-9]{1,3}`, and embedded string prefixes/suffixes.

## ✨ Features

- Deterministic traversal of regex matches (not random like randexp)

- Lexicographic next() string matching

- Supports:

  - `[a-z]{n}` and `[abc]{n}`

  - [a-z]{n,m} range repetitions (unrolled)

  - Literal strings before/after/within regex blocks

- Generates the first match, next match, and total possible combinations

- Written in modern TypeScript with full ESM support

## 🚀 Installation

```bash
npm install regexid
```

Or if you're using Bun:

bash

```
bun add regexid
```

## 🛠️ Usage

```ts
import {
  nextRegexGenerator,
  getFirstValidMatch,
  parseRegex,
  getNextMatch,
  countRegexCombinations,
} from 'regexid'

const pattern = 'ex[a-b]{2}yz[0-2]{1}'

const first = getFirstValidMatch(pattern)
console.log(first) // "exaayz0"

const gen = nextRegexGenerator(pattern, first)

console.log(gen.next().value) // "exaayz1"
console.log(gen.next().value) // "exabyz0"

const total = countRegexCombinations(pattern)
console.log(`Total combinations: ${total}`) // 18
```

## 📚 API

### parseRegex(regexStr: string): RegexToken[]

Parses a simplified regex string into tokenized parts:

```ts
[
{ type: 'literal', value: 'ex' },
{ type: 'range', ranges: [['a','z']], repeat: 1 },
...
]
```

### getFirstValidMatch(regexStr: string): string

Returns the lexicographically first valid string that matches the regex pattern.

### getNextMatch(tokens: RegexToken[], current: string): string | null

Given parsed tokens and a current string, returns the next valid match or null if exhausted.

### nextRegexGenerator(regexStr: string, current: string): Generator<string>

Yields a lexicographically sorted sequence of valid regex matches from the current string onward.

### countRegexCombinations(regexStr: string): number

Returns the total number of deterministic combinations for a supported regex pattern.

- Ignores literal characters

- Unrolls {n,m} as full range

## 🔧 Limitations

For now, this package does not support:

- Regex alternation: (a|b)

- Optional modifiers: ?, \*, +

- Grouping and backreferences

- Negative classes: [^a-z]

## 🧪 Testing

This project uses Mocha + Chai for unit tests.

```bash

npm test
```

## 🤝 Contributing

Pull requests are welcome!
If you’d like to contribute:

Fork this repo

Run tests (npm test)

Follow project style (.prettierrc included)

📄 License
MIT License © 2025 EKlabDev

import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  parseRegex,
  getFirstValidMatch,
  getNextMatch,
  nextRegexGenerator,
  countRegexCombinations,
} from '../src/index.js'

describe('regex-next module', () => {
  describe('parseRegex()', () => {
    it('should parse simple [a-b]{2} pattern', () => {
      const tokens = parseRegex('[a-b]{2}')
      expect(tokens).to.deep.equal([
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
      ])
    })

    it('should parse with literals and range', () => {
      const tokens = parseRegex('ex[a-b]{2}yz')
      expect(tokens).to.deep.equal([
        { type: 'literal', value: 'ex' },
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
        { type: 'literal', value: 'yz' },
      ])
    })

    it('should parse character class without range [abc]{2}', () => {
      const tokens = parseRegex('[abc]{2}')
      expect(tokens).to.deep.equal([
        {
          type: 'range',
          ranges: [
            ['a', 'a'],
            ['b', 'b'],
            ['c', 'c'],
          ],
          repeat: 1,
        },
        {
          type: 'range',
          ranges: [
            ['a', 'a'],
            ['b', 'b'],
            ['c', 'c'],
          ],
          repeat: 1,
        },
      ])
    })

    it('should parse {n,m} expansions', () => {
      const tokens = parseRegex('[a-b]{1,2}')
      expect(tokens).to.deep.equal([
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
        { type: 'range', ranges: [['a', 'b']], repeat: 1 },
      ])
    })
  })

  describe('getFirstValidMatch()', () => {
    it('should return first valid match from [a-c]{2}', () => {
      const result = getFirstValidMatch('[a-c]{2}')
      expect(result).to.equal('aa')
    })

    it('should return full literal + match string', () => {
      const result = getFirstValidMatch('prefix[a]{1}post')
      expect(result).to.equal('prefixapost')
    })
  })

  describe('getNextMatch()', () => {
    it('should return next string in lexicographic order', () => {
      const tokens = parseRegex('[a-c]{2}')
      const next = getNextMatch(tokens, 'aa')
      expect(next).to.equal('ab')
    })

    it('should return null if already at max value', () => {
      const tokens = parseRegex('[a]{2}')
      const next = getNextMatch(tokens, 'aa')
      expect(next).to.be.null
    })
  })

  describe('nextRegexGenerator()', () => {
    it('should yield a list of next matches', () => {
      const pattern = '[a-b]{2}'
      const gen = nextRegexGenerator(pattern, 'aa')
      const results = []
      for (let i = 0; i < 3; i++) results.push(gen.next().value)
      expect(results).to.deep.equal(['ab', 'ba', 'bb'])
    })

    it('should work with literals and ranges', () => {
      const pattern = 'ex[a-b]{1}yz[0-1]{1}'
      const first = getFirstValidMatch(pattern) // → exayz0
      const gen = nextRegexGenerator(pattern, first)
      const values = []
      for (let i = 0; i < 4; i++) values.push(gen.next().value)
      expect(values).to.deep.equal(['exayz1', 'exbyz0', 'exbyz1', undefined]) // loop-through
    })
  })
})
describe('countRegexCombinations()', () => {
  it('should count combinations correctly for ranges only', () => {
    expect(countRegexCombinations('[a-b]{2}')).to.equal(4)
  })

  it('should count combinations with literals', () => {
    expect(countRegexCombinations('ex[a-b]{2}yz')).to.equal(4)
  })

  it('should support mixed-length ranges', () => {
    expect(countRegexCombinations('[a-c]{1,2}')).to.equal(3 * 3 * 3) // 1+2 → 3 + 9
  })
})

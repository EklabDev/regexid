export type RegexToken =
  | { type: 'literal'; value: string }
  | { type: 'range'; ranges: [string, string][]; repeat: number }

export function parseRegex(regexStr: string): RegexToken[] {
  const tokens: RegexToken[] = []
  let cursor = 0

  const rangeRegex = /\[([^\]]+)\]\{(\d+)(?:,(\d+))?\}/g
  let match: RegExpExecArray | null

  while ((match = rangeRegex.exec(regexStr)) !== null) {
    const [fullMatch, rawRange, minStr, maxStr] = match
    const startIdx = match.index
    const endIdx = startIdx + fullMatch.length

    // Capture literal before this pattern
    if (startIdx > cursor) {
      const literal = regexStr.slice(cursor, startIdx)
      tokens.push({ type: 'literal', value: literal })
    }

    // Parse [a-z] or [abc]
    const ranges: [string, string][] = []
    let i = 0
    while (i < rawRange.length) {
      const c = rawRange[i]
      const next = rawRange[i + 1]
      if (next === '-') {
        ranges.push([c, rawRange[i + 2]])
        i += 3
      } else {
        ranges.push([c, c])
        i++
      }
    }

    const min = parseInt(minStr, 10)
    const max = maxStr ? parseInt(maxStr, 10) : min

    // Repeat for all allowed lengths
    for (let r = min; r <= max; r++) {
      for (let i = 0; i < r; i++) {
        tokens.push({ type: 'range', ranges, repeat: 1 })
      }
    }

    cursor = endIdx
  }

  // Capture remaining literal
  if (cursor < regexStr.length) {
    tokens.push({ type: 'literal', value: regexStr.slice(cursor) })
  }

  return tokens
}
export function getFirstValidMatch(regexStr: string): string {
  const tokens = parseRegex(regexStr)

  return tokens
    .flatMap(token =>
      token.type === 'literal'
        ? token.value.split('')
        : Array(token.repeat).fill(token.ranges[0][0])
    )
    .join('')
}
export function getNextMatch(tokens: RegexToken[], current: string): string | null {
  const structure = tokens.flatMap(t =>
    t.type === 'range'
      ? [t]
      : Array.from(t.value).map(ch => ({ type: 'literal', value: ch } as RegexToken))
  )

  const chars = current.split('')
  let i = chars.length - 1

  while (i >= 0) {
    const token = structure[i]

    if (token.type === 'range') {
      const currentChar = chars[i]

      // Find the next valid character in the ranges
      let nextChar: string | null = null

      // First, try to find next character in the current range
      for (const [min, max] of token.ranges) {
        if (currentChar >= min && currentChar < max) {
          nextChar = String.fromCharCode(currentChar.charCodeAt(0) + 1)
          break
        }
      }

      // If no next char in current range, find the first char of the next range
      if (!nextChar) {
        for (const [min, max] of token.ranges) {
          if (currentChar < min) {
            nextChar = min
            break
          }
        }
      }

      if (nextChar) {
        chars[i] = nextChar
        // Reset all range characters after to their minimum
        for (let j = i + 1; j < chars.length; j++) {
          if (structure[j].type === 'range') {
            //@ts-expect-error cannot handle the or datastructure
            chars[j] = structure[j].ranges[0][0]
          }
        }
        return chars.join('')
      }

      // If we can't increment this position, reset it to minimum and continue to previous position
      chars[i] = token.ranges[0][0]
    }

    i--
  }

  return null
}
export function countRegexCombinations(regexStr: string): number {
  const tokens = parseRegex(regexStr)

  return tokens.reduce((total, token) => {
    if (token.type === 'literal') return total // literals contribute only 1
    const count = token.ranges.reduce((sum, [min, max]) => {
      return sum + (max.charCodeAt(0) - min.charCodeAt(0) + 1)
    }, 0)
    return total * count
  }, 1)
}

export function* nextRegexGenerator(regexStr: string, current: string): Generator<string> {
  const parsed = parseRegex(regexStr)
  let next = getNextMatch(parsed, current)
  while (next) {
    yield next
    next = getNextMatch(parsed, next)
  }
}

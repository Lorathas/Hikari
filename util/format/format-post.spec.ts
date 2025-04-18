import {test, expect} from 'bun:test'
import { tokenizeWithWhitespace } from './format-post'

test('tokenizeWithWhitespace', () => {
    const text = 'test text   like this\rtest return\r\ntest crlf\ntest break'

    const tokenized = tokenizeWithWhitespace(text)

    expect(tokenized).toBeArrayOfSize(19)
    expect(tokenized[0]).toBe('test')
    expect(tokenized[1]).toBe(' ')
    expect(tokenized[2]).toBe('text')
    expect(tokenized[3]).toBe('   ')
    expect(tokenized[4]).toBe('like')
    expect(tokenized[5]).toBe(' ')
    expect(tokenized[6]).toBe('this')
    expect(tokenized[7]).toBe('\r')
    expect(tokenized[8]).toBe('test')
    expect(tokenized[9]).toBe(' ')
    expect(tokenized[10]).toBe('return')
    expect(tokenized[11]).toBe('\r\n')
    expect(tokenized[12]).toBe('test')
    expect(tokenized[13]).toBe(' ')
    expect(tokenized[14]).toBe('crlf')
    expect(tokenized[15]).toBe('\n')
    expect(tokenized[16]).toBe('test')
    expect(tokenized[17]).toBe(' ')
    expect(tokenized[18]).toBe('break')
})
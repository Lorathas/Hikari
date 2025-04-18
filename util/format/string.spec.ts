import {test, expect} from 'bun:test'
import {contains, format} from './string'

test('contains', () => {
	expect(contains('')).toBeTrue()
})

test('format', async () => {
	expect(await format('')).toStrictEqual({safe: false, text: ''})
	expect(await format('test')).toStrictEqual({safe: false, text: 'test'})
})
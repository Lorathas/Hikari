import {test, expect} from 'bun:test'
import {contains, format} from './post-link'
import { mockEmbedderContext, mockNotFoundEmbedderContext } from './mock.spec'

test('contains', () => {
	expect(contains('lorem ipsum dolor sit amet')).toBeFalse()
	expect(contains('test')).toBeFalse()
	expect(contains('>a;fdslkj')).toBeFalse()
	expect(contains('>93450')).toBeFalse()
	expect(contains('>>93450')).toBeTrue()
})

test('format', async () => {
	await expect(format('test', mockEmbedderContext)).rejects.toThrowError('Token is not a post-link')

	expect(await format('>>2', mockEmbedderContext)).toStrictEqual({safe: true, text: '<a href="#2">&gt;&gt;2</a>'})
	expect(await format('>>1', mockEmbedderContext)).toStrictEqual({safe: true, text: '<a href="#1">&gt;&gt;1 (OP)</a>'})
	expect(await format('>>4', mockEmbedderContext)).toStrictEqual({safe: true, text: '<a href="/test/3#4">&gt;&gt;4</a>'})
	expect(await format('>>5', mockNotFoundEmbedderContext)).toStrictEqual({safe: false, text: '>>5'})
})
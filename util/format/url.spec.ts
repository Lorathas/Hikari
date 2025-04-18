import {test, expect} from 'bun:test'
import {contains, format} from './url'
import { mockBoard, mockThread } from './mock.spec'

test('contains', () => {
	expect(contains('https://google.com')).toBeTrue()
	expect(contains('https://www.youtube.com/watch?v=dHykKQFtbRU&list=WL&index=70&pp=gAQBiAQB')).toBeTrue()
	expect(contains('ftp://10.20.10.30')).toBeFalse()
	expect(contains('https://10.20.10.30')).toBeTrue()
})

test('format', async () => {
	expect(await format(mockThread, mockBoard, 'https://google.com')).toStrictEqual({safe: true, text: '<a href="https://google.com">https://google.com</a>'})
	expect(await format(mockThread, mockBoard, 'https://www.youtube.com/watch?v=dHykKQFtbRU&list=WL&index=70&pp=gAQBiAQB')).toStrictEqual({safe: true, text:'<a href="https://www.youtube.com/watch?v=dHykKQFtbRU&list=WL&index=70&pp=gAQBiAQB">https://www.youtube.com/watch?v=dHykKQFtbRU&amp;list=WL&amp;index=70&amp;pp=gAQBiAQB</a>'})
	await expect(format(mockThread, mockBoard, 'ftp://10.20.10.30')).rejects.toThrowError('Only http(s) links are supported')
})
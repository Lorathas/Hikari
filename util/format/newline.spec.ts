import {test, expect} from 'bun:test'
import {contains, format} from './newline'
import {mockThread, mockBoard} from './mock.spec'

test('contains', () => {
	expect(contains('skfow keoefl kfg\r')).toBeFalse()
	expect(contains('skfow keoefl kfg\r\n')).toBeFalse()
	expect(contains('skfow keoefl kfg\n')).toBeFalse()

	expect(contains('\r')).toBeTrue()
	expect(contains('\r\n')).toBeTrue()
	expect(contains('\n')).toBeTrue()
	expect(contains('  \n')).toBeTrue()
	expect(contains('  \n  ')).toBeTrue()
	expect(contains('  \r\n  ')).toBeTrue()
	expect(contains('  \r  ')).toBeTrue()
	expect(contains('\r  ')).toBeTrue()
})

test('format', async () => {
    
	await expect(format(mockThread, mockBoard, 'skfow keoefl kfg\r')).rejects.toThrowError('Token contains non-whitespace characters')
	await expect(format(mockThread, mockBoard, 'skfow keoefl kfg')).rejects.toThrowError('Token contains non-whitespace characters')
	await expect(format(mockThread, mockBoard, 'skfow keoefl\r\nkfg')).rejects.toThrowError('Token contains non-whitespace characters')

	expect(await format(mockThread, mockBoard, '\r\n')).toStrictEqual({safe: true, text: '<br/>'})
	expect(await format(mockThread, mockBoard, '  \r\n')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format(mockThread, mockBoard, '  \n')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format(mockThread, mockBoard, '  \r')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format(mockThread, mockBoard, '  \r  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format(mockThread, mockBoard, '  \r\n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format(mockThread, mockBoard, '  \n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format(mockThread, mockBoard, '  \r\n\n  ')).toStrictEqual({safe: true, text: '  <br/><br/>  '})
})
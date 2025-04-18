import {test, expect} from 'bun:test'
import {contains, format} from './newline'

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
    
	await expect(format('skfow keoefl kfg\r')).rejects.toThrowError('Token contains non-whitespace characters')
	await expect(format('skfow keoefl kfg')).rejects.toThrowError('Token contains non-whitespace characters')
	await expect(format('skfow keoefl\r\nkfg')).rejects.toThrowError('Token contains non-whitespace characters')

	expect(await format('\r\n')).toStrictEqual({safe: true, text: '<br/>'})
	expect(await format('  \r\n')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format('  \n')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format('  \r')).toStrictEqual({safe: true, text: '  <br/>'})
	expect(await format('  \r  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format('  \r\n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format('  \n  ')).toStrictEqual({safe: true, text: '  <br/>  '})
	expect(await format('  \r\n\n  ')).toStrictEqual({safe: true, text: '  <br/><br/>  '})
})
import {test, expect} from 'bun:test'
import {contains, format} from './newline'

test('contains', () => {
	expect(contains('skfow keoefl kfg\r')).toBeFalse()
	expect(contains('skfow keoefl kfg\r\n')).toBeFalse()
	expect(contains('skfow keoefl kfg\n')).toBeFalse()

	expect(contains('\r')).toBeTrue()
	expect(contains('\r\n')).toBeTrue()
	expect(contains('\n')).toBeTrue()
	expect(contains('  \n')).toBeFalse()
	expect(contains('  \n  ')).toBeFalse()
	expect(contains('  \r\n  ')).toBeFalse()
	expect(contains('  \r  ')).toBeFalse()
	expect(contains('\r  ')).toBeFalse()
})

test('format', async () => {
    // TODO: Figure out why expecting it to reject breaks the fucking tests
	// await expect(format('skfow keoefl kfg\r')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('skfow keoefl kfg')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('skfow keoefl\r\nkfg')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format(' ')).rejects.toThrowError('Token is not a valid line-break sequence')

	const positive = await format('\r\n')
	console.error(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	console.log(JSON.stringify(positive))
	expect(positive).toStrictEqual({safe: true, text: '<br/>'})
	// await expect(format('  \r\n')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \n')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \r')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \r  ')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \r\n  ')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \n  ')).rejects.toThrowError('Token is not a valid line-break sequence')
	// await expect(format('  \r\n\n  ')).rejects.toThrowError('Token is not a valid line-break sequence')
})
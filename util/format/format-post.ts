import type { EmbeddedToken } from './embed-formatter'

const whitespaceRegex = /^\s*$/

export default function formatPost(text: string): Promise<EmbeddedToken[]> {
	throw 'NotImplemented'
}

const tokenizeRegex = /(\s+|\S+)/g

export function tokenizeWithWhitespace(input: string): string[] {
	const tokens = input.match(tokenizeRegex) || []
	return tokens
}

import type { EmbeddedToken, TokenEmbedder } from './embed-formatter'

const matchesRegex = /^\s*$/
const lineBreakRegex = /(\r\n|\r|\n)/g

export function contains(token: string): boolean {
	return matchesRegex.test(token)
}

export function format(token: string): Promise<EmbeddedToken> {
	if (!matchesRegex.test(token)) {
		return Promise.reject(new Error('Token contains non-whitespace characters'))
	}

	const formatted = token.replaceAll(lineBreakRegex, '<br/>')

	return Promise.resolve({
		safe: true,
		text: formatted
	})
}

const newlineFormatter: TokenEmbedder = {
	contains,
	format
}

export default newlineFormatter
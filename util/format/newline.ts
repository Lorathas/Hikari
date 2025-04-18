import type { EmbeddedToken, TokenEmbedder } from './embed-formatter'

export function contains(token: string): boolean {
	return token === '\r' || token === '\r\n' || token === '\n'
}

export function format(token: string): Promise<EmbeddedToken> {
	if (!contains(token)) {
		throw Promise.reject(new Error('Token is not a valid line-break sequence'))
	}

	return Promise.resolve({
		safe: true,
		text: '<br/>'
	})
}

const newlineEmbedder: TokenEmbedder = {
	contains,
	format
}

export default newlineEmbedder
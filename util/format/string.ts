import type { EmbeddedToken, TokenEmbedder } from './embed-formatter'


export function format(token: string): Promise<EmbeddedToken> {
	return Promise.resolve({
		safe: false,
		text: token
	})
}

export function contains() {
	return true
}

const stringFormatter: TokenEmbedder = {
	format,
	contains
}

export default stringFormatter
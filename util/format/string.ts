import type { EmbeddedToken, EmbedderContext, TokenEmbedder } from './embed-formatter'


function format(token: string): Promise<EmbeddedToken> {
	return Promise.resolve({
		safe: false,
		text: token
	})
}

function contains(token: string) {
	return true
}

const stringFormatter: TokenEmbedder = {
	format,
	contains
}

export default stringFormatter
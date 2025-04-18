import type { EmbeddedToken, TokenEmbedder } from './embed-formatter'
import * as ejs from 'ejs'
import { z } from 'zod'

const schema = z.string().url().startsWith('http')

export function contains(token: string): boolean {
	const res = schema.safeParse(token)

	return res.success
}

export async function format(token: string): Promise<EmbeddedToken> {
	if (!contains(token)) {
		throw new Error('Only http(s) links are supported')
	}

	return {
		safe: true,
		text: await ejs.renderFile('views/embeds/url.ejs', {url: token})
	}
}

const urlEmbedder: TokenEmbedder = {
	contains,
	format
}

export default urlEmbedder
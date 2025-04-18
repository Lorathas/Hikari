import type { WithId } from 'mongodb'
import type { Thread } from '../../data/post'
import type { EmbeddedToken, TokenEmbedder } from './embed-formatter'
import type { Board } from '../../data/board'
import * as ejs from 'ejs'
import { z } from 'zod'

const schema = z.string().url().startsWith('http')

export function contains(token: string): boolean {
	const res = schema.safeParse(token)

	return res.success
}

export async function format(thread: WithId<Thread>, board: WithId<Board>, token: string): Promise<EmbeddedToken> {
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
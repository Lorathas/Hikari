import type { Post } from '../../data/post'
import tryFind from '../fp/try-find'
import * as ejs from 'ejs'
import type { EmbeddedToken, EmbedderContext, TokenEmbedder } from './embed-formatter'

const tokenRegex = />>(\d+)/

export async function format(token: string, context: EmbedderContext): Promise<EmbeddedToken> {
	const match = tokenRegex.exec(token)

	if (!match) {
		throw new Error('Token is not a post-link')
	}

	const postNumber: number = parseInt(match![1]!)

	let referencedPost: Post | undefined

	if (postNumber === context.thread.id) {
		return {
			safe: true,
			text: await ejs.renderFile('views/embeds/post-link-op.ejs', {
				board: context.board.slug,
				threadNumber: context.thread.id,
				postNumber,
			}),
		}
	} else if (
		tryFind(
			context.thread.posts,
			(p) => p.id === postNumber,
			(p) => (referencedPost = p)
		)
	) {
		return {
			safe: true,
			text: await ejs.renderFile('views/embeds/post-link.ejs', {
				board: context.board.slug,
				threadNumber: context.thread.id,
				postNumber: referencedPost!.id,
			}),
		}
	} else {
		const threadPost = await context.findThreadWithPostNumber(postNumber)

		if (!threadPost) {
			return {
				safe: false,
				text: token,
			}
		}

		return {
			safe: true,
			text: await ejs.renderFile('views/embeds/post-link-same-board.ejs', {
				board: context.board.slug,
				threadNumber: threadPost.id,
				postNumber: threadPost.post.id,
			}),
		}
	}
}

export function contains(token: string): boolean {
	return tokenRegex.test(token)
}

const postLinkFormatter: TokenEmbedder = {
	format,
	contains
}

export default postLinkFormatter
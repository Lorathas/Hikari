import type { EmbeddedToken, EmbedderContext, TokenEmbedder } from './embed-formatter'
import stringEmbedder from './string'
import postLinkEmbedder from './post-link'
import newlineEmbedder from './newline'
import urlEmbedder from './url'
import type { EmbeddedPost, EmbeddedThread, Thread } from '../../data/post'

const embedderRegistry: TokenEmbedder[] = [
	postLinkEmbedder,
	newlineEmbedder,
	urlEmbedder,
]

export async function formatPostText(text: string, context: EmbedderContext): Promise<EmbeddedToken[]> {
	const tokens = tokenizeWithWhitespace(text)

	const processedTokens: EmbeddedToken[] = []

	for (const token of tokens) {
		let embedded = false
		for (const embedder of embedderRegistry) {
			if (!embedder.contains(token)) {
				continue
			}

			processedTokens.push(await embedder.format(token, context))
			embedded = true
			break
		}

		if (!embedded) {
			if (processedTokens.length > 0 && !processedTokens.at(-1)!.safe) {
				processedTokens.at(-1)!.text += token
			} else {
				processedTokens.push(await stringEmbedder.format(token, context))
			}
		}
	}

	return processedTokens
}

export async function formatThread(thread: Thread, context: EmbedderContext): Promise<EmbeddedThread> {
	const embedded: EmbeddedThread = thread

	embedded.embeds = await formatPostText(embedded.text, context)

	embedded.posts = await Promise.all(embedded.posts.map(async (post: EmbeddedPost) => {
		post.embeds = await formatPostText(post.text, context)

		return post
	}))
	
	return embedded
}

const tokenizeRegex = /(\r\n|\n|\s+|\S+)/g

export function tokenizeWithWhitespace(input: string): string[] {
	const tokens = input.match(tokenizeRegex) || []
	return tokens
}

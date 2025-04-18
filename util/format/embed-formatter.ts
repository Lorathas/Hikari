import type { WithId } from 'mongodb'
import type { Board } from '../../data/board'
import type { Thread } from '../../data/post'
import type { ThreadPost } from '../../data/views/thread-post'

export interface TokenEmbedder {
    contains(token: string): boolean
    format(token: string, context: EmbedderContext): Promise<EmbeddedToken>
}

export interface EmbeddedToken {
    safe: boolean
    text: string
}

export interface EmbedderContext {
	board: WithId<Board>
	thread: WithId<Thread>
	findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => Promise<ThreadPost|undefined>
    findThreadWithPostNumber: (postNumber: number) => Promise<ThreadPost|undefined>
}
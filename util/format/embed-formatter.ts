import type { WithId } from 'mongodb'
import {Board, type BoardData} from '../../data/board'
import type { Thread } from '../../data/post'
import type { ThreadPost } from '../../data/views/thread-post'
import { z } from 'zod'
import type Page from '../../data/page'
import type {ThreadRow} from '../../data/dal/thread-dal.ts'

export interface TokenEmbedder {
    contains(token: string): boolean
    format(token: string, context: EmbedderContext): Promise<EmbeddedToken>
}

export interface EmbeddedToken {
    safe: boolean
    text: string
}

export interface EmbedderContext {
    page: Page
	board: Board
	thread: Thread
	findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => Promise<ThreadRow|undefined>
    findThreadWithPostNumber: (postNumber: number) => Promise<ThreadRow|undefined>
}

export const EmbeddedTokenSchema = z.object({
	safe: z.boolean(),
	text: z.string()
})
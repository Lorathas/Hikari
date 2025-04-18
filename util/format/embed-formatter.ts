import type { WithId } from 'mongodb'
import type { Board } from '../../data/board'
import type { Thread } from '../../data/post'

export interface TokenEmbedder {
    contains(token: string): boolean
    format(thread: WithId<Thread>, board: WithId<Board>, token: string): Promise<EmbeddedToken>
}

export interface EmbeddedToken {
    safe: boolean
    text: string
}
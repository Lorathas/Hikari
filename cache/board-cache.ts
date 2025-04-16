import type Board from "../data/board";
import {ObjectId, type WithId} from "mongodb";
import * as boardDal from '../data/dal/board-dal'

const boardIdCache: {[id: string]: WithId<Board>} = {}
const boardSlugCache: {[name: string]: WithId<Board>} = {}

export function getBoard(boardId: ObjectId|string): Promise<WithId<Board>> {
    return typeof boardId === 'string'
        ? getCachedBoardBySlug(boardId)
        : getCachedBoardById(boardId)
}

export async function getCachedBoardById(boardId: ObjectId): Promise<WithId<Board>> {
    if (!boardIdCache.hasOwnProperty(boardId.toHexString())) {
        const board = await boardDal.getById(boardId)

        if (!board) {
            const err = `Board not found for ID ${boardId.toHexString()}`
            console.warn(err)
            throw err
        }

        console.info(`Board not found in cache {_id: ${board._id.toHexString()}, name: ${board.name}}`)
        boardIdCache[board._id.toHexString()] = board

        if (boardSlugCache.hasOwnProperty(board.slug)) {
            console.warn(`Board not found in ID cache, but found in Name cache {_id: ${board._id.toHexString()}, slug: ${board.slug}}`)
        } else {
            boardSlugCache[board.slug] = board
        }
    }

    return boardIdCache[boardId.toHexString()]!
}

export async function getCachedBoardBySlug(slug: string): Promise<WithId<Board>> {
    if (!boardSlugCache.hasOwnProperty(slug)) {
        const board = await boardDal.getBySlug(slug)

        if (!board) {
            const err = `Board not found for slug ${slug}`
            console.warn(err)
            throw err
        }

        console.info(`Board not found in cache {_id: ${board._id.toHexString()}, slug: ${board.slug}}`)
        boardSlugCache[board.slug] = board

        if (boardIdCache.hasOwnProperty(board._id.toHexString())) {
            console.warn(`Board not found in Name cache, but found in ID cache {_id: ${board._id.toHexString()}, slug: ${board.slug}}`)
        } else {
            boardIdCache[board._id.toHexString()] = board
        }
    }

    return boardSlugCache[slug]!
}
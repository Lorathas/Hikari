import {type Board, type BoardConfig} from "../data/board";
import {ObjectId, type WithId} from "mongodb";
import * as boardDal from '../data/dal/board-dal'
import { boardDefaults } from "../data/db";
import {omit, defaultsDeep} from 'lodash'

let boardConfigDefault: BoardConfig|null = null
const boardIdCache: {[id: string]: WithId<Board>} = {}
const boardSlugCache: {[name: string]: WithId<Board>} = {}

export function getBoard(boardId: ObjectId|string): Promise<WithId<Board>> {
    return typeof boardId === 'string'
        ? getCachedBoardBySlug(boardId)
        : getCachedBoardById(boardId)
}

async function initBoardConfigDefault() {
    if (boardConfigDefault) {
        return
    }

    const boardConfig = await boardDefaults.findOne()

    if (!boardConfig) {
        console.error('Default board config not found')
        throw 'Default board config not found'
    }

    boardConfigDefault = <BoardConfig> omit(boardConfig, ['_id'])
}

export async function getCachedBoardById(boardId: ObjectId): Promise<WithId<Board>> {
    if (!boardIdCache.hasOwnProperty(boardId.toHexString())) {
        const board = await boardDal.getById(boardId)

        if (!board) {
            const err = `Board not found for ID ${boardId.toHexString()}`
            console.warn(err)
            throw err
        }

        await initBoardConfigDefault()

        board.config = defaultsDeep(board.config, boardConfigDefault)

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

        await initBoardConfigDefault()

        board.config = defaultsDeep(board.config, boardConfigDefault)

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
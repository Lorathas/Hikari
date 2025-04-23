import {type BoardConfig, Board} from '../data/board'
import * as boardDal from '../data/dal/board-dal.ts'
import {omit, defaultsDeep} from 'lodash'
import * as boardDefaultsDal from '../data/dal/board-defaults-dal.ts'

let boardConfigDefault: BoardConfig|null = null
const boardIdCache = new Map<number, Board>()
const boardSlugCache = new Map<string, Board>()

export async function initialize() {
	const boards = (await boardDal.getAll()).map((b) => new Board(b))

	for (const board of boards) {
		boardIdCache.set(board.id, board)
		boardSlugCache.set(board.slug, board)
	}
}

/**
 * Get Board by ID or Slug
 * @param boardIdOrSlug Board ID or Board Slug
 */
export function getBoard(boardIdOrSlug: number|string): Promise<Board> {
	return typeof boardIdOrSlug === 'string'
		? getCachedBoardBySlug(boardIdOrSlug)
		: getCachedBoardById(boardIdOrSlug)
}

/**
 * Initialize the Board cache
 */
async function initBoardConfigDefault() {
	if (boardConfigDefault) {
		return
	}

	const boardConfig = await boardDefaultsDal.getBoardDefaults()

	if (!boardConfig) {
		console.error('Default board config not found')
		throw 'Default board config not found'
	}

	boardConfigDefault = <BoardConfig> omit(boardConfig, ['_id'])
}

/**
 * Get cached Board based on it's ID
 * @param boardId ID of the Board
 */
export async function getCachedBoardById(boardId: number): Promise<Board> {
	// eslint-disable-next-line no-prototype-builtins
	if (!boardIdCache.hasOwnProperty(boardId)) {
		const boardRow = await boardDal.getById(boardId)

		if (!boardRow) {
			const err = `Board not found for ID ${boardId}`
			console.warn(err)
			throw err
		}

		await initBoardConfigDefault()

		boardRow.config = defaultsDeep(boardRow.config ?? {}, boardConfigDefault)

		const board = new Board(boardRow)

		console.info(`Board not found in cache {id: ${boardRow.id}, name: ${boardRow.name}}`)
		boardIdCache.set(boardRow.id, board)

		if (boardSlugCache.has(boardRow.slug)) {
			console.warn(`Board not found in ID cache, but found in Name cache {_id: ${boardRow.id}, slug: ${boardRow.slug}}`)
		} else {
			boardSlugCache.set(boardRow.slug, board)
		}
	}

	return boardIdCache.get(boardId)!
}

/**
 * Get cached Board by its Slug
 * @param slug Slug of the Board
 */
export async function getCachedBoardBySlug(slug: string): Promise<Board> {
	if (!boardSlugCache.has(slug)) {
		try {
			const boardRow = await boardDal.getBySlug(slug)

			if (!boardRow) {
				const err = `Board not found for slug ${slug}`
				console.warn(err)
				throw err
			}

			await initBoardConfigDefault()

			boardRow.config = defaultsDeep(boardRow.config, boardConfigDefault)

			const board = new Board(boardRow)

			console.info(`Board not found in cache {id: ${boardRow.id}, slug: ${boardRow.slug}}`)
			boardSlugCache.set(boardRow.slug, board)

			if (boardIdCache.has(boardRow.id)) {
				console.warn(`Board not found in Name cache, but found in ID cache {id: ${boardRow.id}, slug: ${boardRow.slug}}`)
			} else {
				boardIdCache.set(boardRow.id, board)
			}
		} catch (error) {
			throw error
		}
	}

	return boardSlugCache.get(slug)!
}

export async function hasBoardForSlug(slug: string): Promise<boolean> {
	return boardSlugCache.has(slug)
}

export async function hasBoardForId(id: number): Promise<boolean> {
	return boardIdCache.has(id)
}
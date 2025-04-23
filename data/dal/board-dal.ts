import type {BoardConfig} from '../board.ts'
import {db} from '../pg-db.ts'
import {ParameterizedQuery as PQ} from 'pg-promise'

/**
 * Type representing the internal board table structure
 */
export interface BoardRow {
	id: number
	name: string
	slug: string
	description: string
	last_post_id: number
	is_public: boolean
	config: BoardConfig
}

/**
 * Insert board into the database
 * @param board BoardRow to add to the database
 * @returns board created in the database
 */
export async function insertBoard(board: BoardRow): Promise<BoardRow> {
	return await db.one<BoardRow>(new PQ({
		text: 'INSERT INTO boards (name, slug, description, is_public, config) VALUES ($1, $2, $3, $4, $5);',
		values: [board.name, board.slug, board.description, board.last_post_id, board.is_public, board.config]
	}))
}

/**
 * Query board by its name
 * @param name Name of the board
 * @returns Board if it exists, otherwise null
 */
export async function getByName(name: string): Promise<BoardRow|null> {
	return await db.oneOrNone<BoardRow>(new PQ({text: 'SELECT * FROM boards WHERE name=?', values: [name]}))
}

/**
 * Query board by its slug
 * @param slug Slug of the board
 * @returns Board if it exists, otherwise null
 */
export async function getBySlug(slug: string): Promise<BoardRow|null> {
	return await db.oneOrNone<BoardRow>(new PQ({text: 'SELECT * FROM boards WHERE slug = $1', values: [slug]}))
}

/**
 * Query board by its id
 * @param id ID of the board
 * @returns Board if it exists, otherwise null
 */
export async function getById(id: number): Promise<BoardRow|null> {
	return await db.oneOrNone<BoardRow>(new PQ({text: 'SELECT * FROM boards WHERE id = $1', values: [id]}))
}

/**
 * Get all Boards in the database
 * @returns Array of all boards
 */
export async function getAll(): Promise<Array<BoardRow>> {
	return await db.many<BoardRow>('SELECT * FROM BOARDS ORDER BY name;')
}
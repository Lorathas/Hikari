import {db} from '../pg-db'
import type {BoardConfig} from '../board.ts'

export async function getBoardDefaults(): Promise<BoardConfig> {
	return db.one('SELECT * FROM board_defaults LIMIT 1;')
}
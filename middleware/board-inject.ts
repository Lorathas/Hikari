import {type NextFunction, type Response} from 'express'
import {type SiteRequest} from './site-request'
import * as boardCache from '../cache/board-cache'
import {type Board} from '../data/board'
import type { WithId } from 'mongodb'

export interface BoardRequest extends SiteRequest {
    board: WithId<Board>
}

export async function boardInjectMiddleware(req: BoardRequest, res: Response, next: NextFunction) {
	try {
		if (typeof req.params.board !== 'string') {
			next()
			return
		}

		const board = await boardCache.getBoard(req.params.board)

		if (!board) {
			res.redirect('/404')
			return
		}

		req.board = board
		next()
	} catch {
		console.error(`Board not found with slug "${req.params.board}"`)
		res.redirect('/404')
	}
}
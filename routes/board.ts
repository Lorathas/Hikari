import {type Response, Router} from 'express'
import * as threadDal from '../data/dal/thread-dal'
import {boardInjectMiddleware, type BoardRequest} from '../middleware/board-inject'


const boardRouter = Router()

async function getBoard(req: BoardRequest, res: Response) {
	if (req.url === `/${req.board.slug}`) {
		res.redirect(301, `/${req.board.slug}/`)
		return
	}

	const threads = await (await threadDal.getPage(req.board._id)).toArray()

	res.render('pages/board', {
		board: req.board,
		threads
	})
}

function getCatalog(req: BoardRequest, res: Response) {
	const catalog = threadDal.getCatalog(req.board._id)
}

boardRouter.use('/:board', boardInjectMiddleware)
boardRouter.get('/:board', getBoard)
boardRouter.get('/:board/board', getBoard)
boardRouter.get('/:board/catalog', getCatalog)

export default boardRouter
import {type Response, Router} from 'express'
import * as threadDal from '../data/dal/thread-dal'
import {boardInjectMiddleware, type BoardRequest} from '../middleware/board-inject'
import type { EmbedderContext } from '../util/format/embed-formatter'
import { formatPost } from '../util/format/format-post'
import { EmbeddedPostSchema, type EmbeddedPost, type EmbeddedThread, type Thread } from '../data/post'
import type { WithId } from 'mongodb'
import Page from '../data/page'


const boardRouter = Router()

async function getBoard(req: BoardRequest, res: Response) {
	if (req.url === `/${req.board.slug}`) {
		res.redirect(301, `/${req.board.slug}/`)
		return
	}

	const threads: WithId<Thread>[] = await (await threadDal.getPage(req.board._id)).toArray()

	const embedPromises = threads.map(async (thread: WithId<EmbeddedThread>) => {
		const context: EmbedderContext = {
			page: Page.Board,
			board: req.board,
			thread,
			findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(boardSlug, postNumber) },
			findThreadWithPostNumber: (postNumber: number) => { return threadDal.getThreadPostForNumber(req.board._id, postNumber) }
		}

		thread.embeds = await formatPost(thread.text, context)

		thread.posts = await Promise.all(thread.posts.map(async (post: EmbeddedPost) => {
			post.embeds = await formatPost(post.text, context)

			return post
		}))

		return thread
	})

	const embeddedThreads = await Promise.all(embedPromises)

	res.render('pages/board', {
		board: req.board,
		threads: embeddedThreads,
		page: Page.Board
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
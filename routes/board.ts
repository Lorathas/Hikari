import {type NextFunction, type Response, Router} from 'express'
import * as threadDal from '../data/dal/thread-dal'
import {boardInjectMiddleware, type BoardRequest} from '../middleware/board-inject'
import type { EmbedderContext } from '../util/format/embed-formatter'
import { formatPostText, formatThread } from '../util/format/format-post'
import { EmbeddedPostSchema, type EmbeddedPost, type EmbeddedThread, type Thread } from '../data/post'
import type { WithId } from 'mongodb'
import Page from '../data/page'
import { z } from 'zod'


const boardRouter = Router()

const BoardQuerySchema = z.object({
	board: z.string()
})

const ThreadQuerySchema = BoardQuerySchema.extend({
	threadNumber: z.coerce.number().int().positive()
})

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

		thread.embeds = await formatPostText(thread.text, context)

		thread.posts = await Promise.all(thread.posts.map(async (post: EmbeddedPost) => {
			post.embeds = await formatPostText(post.text, context)

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

async function getCatalog(req: BoardRequest, res: Response) {
	const catalog = await threadDal.getCatalog(req.board._id)

	res.render('pages/catalog', {
		board: req.board,
		threads: catalog,
		page: Page.Catalog
	})
}

async function getThread(req: BoardRequest, res: Response, next: NextFunction) {
	const params = ThreadQuerySchema.safeParse(req.params)

	if (!params.success) {
		next()
		return
	}

	const thread = await threadDal.getThread(req.board._id, params.data!.threadNumber)

	if (!thread) {
		next()
		return
	}

	const context: EmbedderContext = {
		page: Page.Thread,
		board: req.board,
		thread: thread!,
		findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(boardSlug, postNumber) },
		findThreadWithPostNumber: (postNumber: number) => { return threadDal.getThreadPostForNumber(req.board._id, postNumber) }
	}

	const embedded = await formatThread(thread, context)

	res.render('pages/thread', {
		board: req.board,
		thread: embedded,
		page: Page.Thread
	})
}

boardRouter.use('/:board', boardInjectMiddleware)
boardRouter.get('/:board', getBoard)
boardRouter.get('/:board/board', getBoard)
boardRouter.get('/:board/catalog', getCatalog)
boardRouter.get('/:board/:threadNumber', getThread)

export default boardRouter
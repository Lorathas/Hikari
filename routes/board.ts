import {type NextFunction, type Response, Router} from 'express'
import * as threadDal from '../data/dal/thread-dal.ts'
import {boardInjectMiddleware, type BoardRequest} from '../middleware/board-inject'
import type { EmbedderContext } from '../util/format/embed-formatter'
import { formatPostText, formatThread } from '../util/format/format-post'
import { type EmbeddedPost, type EmbeddedThread, type Thread } from '../data/post'
import type { WithId } from 'mongodb'
import Page from '../data/page'
import { z } from 'zod'
import type { BoardData } from '../data/board'


const boardRouter = Router()

const BoardQuerySchema = z.object({
	board: z.string()
})

const ThreadQuerySchema = BoardQuerySchema.extend({
	threadNumber: z.coerce.number().int().positive()
})

const BoardPageQuerySchema = z.object({
	p: z.number().int().positive()
})

type BoardPageQuery = z.infer<typeof BoardPageQuerySchema>

//region Internal Logic

async function getThreadInternal(thread: WithId<Thread>, board: WithId<BoardData>) {
	const context: EmbedderContext = {
		page: Page.Thread,
		board: board,
		thread: thread!,
		findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(boardSlug, postNumber) },
		findThreadWithPostNumber: (postNumber: number) => { return threadDal.getThreadPostForNumber(board._id, postNumber) }
	}

	return await formatThread(thread, context)
}

//endregion

//region Express Routes

async function getBoard(req: BoardRequest, res: Response) {
	if (req.url === `/${req.board.slug}`) {
		res.redirect(301, `/${req.board.slug}/`)
		return
	}

	const queryParse = BoardPageQuerySchema.safeParse(req.query)

	let query: BoardPageQuery
	if (queryParse.success) {
		query = queryParse.data
	} else {
		query = { p: 0 }
	}

	const threads= await threadDal.getCatalogPage(req.board.threadTableName, query.p)

	const embedPromises = threads.map(async (thread: EmbeddedThread) => {
		const context: EmbedderContext = {
			page: Page.Board,
			board: req.board,
			thread,
			findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(boardSlug, postNumber) },
			findThreadWithPostNumber: (postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(req.board.slug, postNumber) }
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
	const catalog = await threadDal.getCatalogPage(req.board.id)

	res.render('pages/catalog', {
		board: req.board,
		threads: catalog,
		page: Page.Catalog
	})
}

async function getThreadExpress(req: BoardRequest, res: Response, next: NextFunction) {
	const params = ThreadQuerySchema.safeParse(req.params)

	if (!params.success) {
		next()
		return
	}

	const thread = await threadDal.getThreadById(req.board.id, params.data!.threadNumber)

	if (!thread) {
		next()
		return
	}

	const embedded = await getThreadInternal(thread, req.board)

	res.render('pages/thread', {
		board: req.board,
		thread: embedded,
		page: Page.Thread
	})
}

//endregion

boardRouter.use('/:board', boardInjectMiddleware)
boardRouter.get('/:board', getBoard)
boardRouter.get('/:board/board', getBoard)
boardRouter.get('/:board/catalog', getCatalog)
boardRouter.get('/:board/:threadNumber', getThreadExpress)

export default boardRouter
import {type NextFunction, type Response, Router} from 'express'
import * as threadDal from '../data/dal/thread-dal'
import {boardInjectMiddleware, type BoardRequest} from '../middleware/board-inject'
import type { EmbedderContext } from '../util/format/embed-formatter'
import { formatPostText, formatThread } from '../util/format/format-post'
import { EmbeddedPostSchema, type EmbeddedPost, type EmbeddedThread, type Thread } from '../data/post'
import type { WithId } from 'mongodb'
import Page from '../data/page'
import { z } from 'zod'
import type { Board } from '../data/board'
import * as bun from 'bun'
import * as boardCache from '../cache/board-cache'
import ejs from 'ejs'


const boardRouter = Router()

const BoardQuerySchema = z.object({
	board: z.string()
})

const ThreadQuerySchema = BoardQuerySchema.extend({
	threadNumber: z.coerce.number().int().positive()
})

//region Internal Logic

async function getThreadInternal(thread: WithId<Thread>, board: WithId<Board>) {
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

async function getThreadExpress(req: BoardRequest, res: Response, next: NextFunction) {
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

	const embedded = await getThreadInternal(thread, req.board)

	res.render('pages/thread', {
		board: req.board,
		thread: embedded,
		page: Page.Thread
	})
}

//endregion

//region Bun Request Handlers

/**
 * GET Board page
 * Bun API Bersion
 * @param req
 */
export async function getBoardBun(req: bun.BunRequest) {
	const board = await boardCache.getCachedBoardBySlug(req.params.board)

	if (!board) {
		return Response.redirect('/404')
	}

	const threads: WithId<Thread>[] = await (await threadDal.getPage(board._id)).toArray()

	// Embed threads with their specific context
	const embedPromises = threads.map(async (thread: WithId<EmbeddedThread>) => {
		const context: EmbedderContext = {
			page: Page.Board,
			board: board,
			thread,
			findThreadOnBoardWithPostNumber: (boardSlug: string, postNumber: number) => { return threadDal.getThreadPostForBoardSlugAndNumber(boardSlug, postNumber) },
			findThreadWithPostNumber: (postNumber: number) => { return threadDal.getThreadPostForNumber(req.board._id, postNumber) }
		}

		return await formatThread(thread, context)
	})

	const embeddedThreads = await Promise.all(embedPromises)

	return new Response(await ejs.renderFile('views/pages/board', {
		board: board,
		threads: embeddedThreads,
		page: Page.Board
	}))
}

/**
 * GET Catalog page
 * Bun API Version
 * @param req
 * @param res
 */
export async function getCatalogBun(req: bun.BunRequest) {
	const board = await boardCache.getCachedBoardBySlug(req.params.board)

	if (!board) {
		return Response.redirect('/404')
	}

	const catalog = await threadDal.getCatalog(board._id)

	return new Response(await ejs.renderFile('views/pages/catalog', {
		board: board,
		threads: catalog,
		page: Page.Catalog
	}))
}

/**
 * GET Thread page
 * Bun API Version
 * @param req Request
 */
export async function getThreadBun(req: bun.BunRequest) {
	const board = await boardCache.getCachedBoardBySlug(req.params.board)

	if (!board) {
		return Response.redirect('/404')
	}

	const thread = await threadDal.getThread(board._id, req.params.threadNumber)

	if (!thread) {
		return Response.redirect('/404')
	}

	const embedded = await getThreadInternal(thread, board)

	return new Response(await ejs.renderFile('views/pages/thread', {
		board,
		thread: embedded,
		page: Page.Thread
	}), { status: 200 })
}

//endregion

boardRouter.use('/:board', boardInjectMiddleware)
boardRouter.get('/:board', getBoard)
boardRouter.get('/:board/board', getBoard)
boardRouter.get('/:board/catalog', getCatalog)
boardRouter.get('/:board/:threadNumber', getThreadExpress)

export default boardRouter
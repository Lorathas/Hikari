import {AggregationCursor, ObjectId, type Document, type WithId} from 'mongodb'
import {getThreadCollectionForBoard} from '../db'
import * as boardCache from '../../cache/board-cache'
import {type Thread} from '../post'
import {clamp} from '../../util/math'
import {type ThreadPost} from '../views/thread-post'

function aggregateQuery(boardId: ObjectId): Document[] {
	return [
		{$sort: {bumpTime: -1}}
	]
}

function pageQuery(replyLimit: number): Document[] {
	return [
		{$match: {deleted: false}},
		{
			$set: {
				posts: {
					$slice: [
						{
							$sortArray: {
								input: {
									$filter: {
										input: '$posts',
										as: 'post',
										cond: {$eq: ['$$post.deleted', false]}
									}
								},
								sortBy: {createdAt: -1}
							}
						},
						replyLimit
					]
				}
			}
		},
		{
			$set: {
				posts: {
					$sortArray: {
						input: {
							$filter: {
								input: '$posts',
								as: 'post',
								cond: {$eq: ['$$post.deleted', false]}
							}
						},
						sortBy: {createdAt: 1}
					}
				}
			}
		}
	]
}

function threadForNumberQuery(threadNo: number): Document[] {
	return [
		{$match: {id: threadNo, deleted: false}},
		{
			$set: {
				posts: {
					$sortArray: {
						input: {
							$filter: {
								input: '$posts',
								as: 'post',
								cond: {$eq: ['$$post.deleted', false]}
							}
						},
						sortBy: {createdAt: 1}
					}
				}
			}
		}
	]
}

function threadForPostQuery(postNo: number): Document[] {
	return [
		{$match: {'posts.id': postNo}},
		{$unwind: '$posts'},
		{$match: {'posts.id': postNo}},
		{$set: {post: '$posts'}},
		{$unset: 'posts'}
	]
}

/**
 * Query the board in page format with config number of replies
 * @param boardId ID of the board
 * @param page Page of the board to fetch
 * @returns 
 */
export async function getPage(boardId: ObjectId, page: number|undefined = undefined): Promise<AggregationCursor<WithId<Thread>>> {
	const board = await boardCache.getCachedBoardById(boardId)

	const actualPage: number = page ?? 0
    
	page = clamp(actualPage, 0, board.config.pages.limit - 1)

	const query = pageQuery(board.config.query.boardReply)
	query.push({$skip: actualPage * board.config.pages.size})
	query.push({$limit: board.config.pages.limit})


	const threads = await getThreadCollectionForBoard(boardId)
    
	return await threads.aggregate<Thread>(query)
}

/**
 * Query the board in a catalog format without posts
 * @param boardId ID of the board
 * @returns Catalog threads for the board
 */
export async function getCatalog(boardId: ObjectId): Promise<AggregationCursor<Thread>> {
	const board = await boardCache.getCachedBoardById(boardId)

	const query = aggregateQuery(boardId)
	query.push({$limit: board.config.pages.size * board.config.pages.limit})

	const threads = await getThreadCollectionForBoard(boardId)
    
	return await threads.aggregate<Thread>(query)
}

/**
 * Get thread by it's number
 * @param boardId ID of the board the thread is on
 * @param threadNo Number of the thread
 * @returns Thread if it exists, otherwise null
 */
export async function getThread(boardId: ObjectId, threadNo: number): Promise<WithId<Thread>|undefined> {
	const board = await boardCache.getCachedBoardById(boardId)

	if (!board) {
		return undefined
	}

	const query = threadForNumberQuery(threadNo)

	const threads = await getThreadCollectionForBoard(boardId)

	const results = await threads.aggregate<WithId<Thread>>(query).toArray()

	if (results.length > 0) {
		return results[0]!
	} else {
		return undefined
	}
}

/**
 * Get thread for post in ThreadPost format
 * @param boardId ID of the board the post is on
 * @param postNo Number of the post
 * @returns ThreadPost for the post if it exists, otherwise null
 */
export async function getThreadPostForNumber(boardId: ObjectId, postNo: number): Promise<ThreadPost|undefined> {
	const board = await boardCache.getCachedBoardById(boardId)

	const query = threadForPostQuery(postNo)

	const threads = await getThreadCollectionForBoard(boardId)

	const postThreads = await threads.aggregate<ThreadPost>(query).toArray()

	if (postThreads.length > 0) {
		return postThreads[0]!
	} else {
		return undefined
	}
}

export async function getThreadPostForBoardSlugAndNumber(boardSlug: string, postNo: number): Promise<ThreadPost|undefined> {
	const board = await boardCache.getCachedBoardBySlug(boardSlug)

	const query = threadForPostQuery(postNo)

	const threads = await getThreadCollectionForBoard(board._id)

	const postThreads = await threads.aggregate<ThreadPost>(query).toArray()

	if (postThreads.length > 0) {
		return postThreads[0]!
	} else {
		return undefined
	}
}
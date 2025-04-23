import {db} from '../pg-db'
import {ParameterizedQuery as PQ, PreparedStatement as PS} from 'pg-promise'
import type {Thread} from '../post.ts'
import type {CatalogThreadView} from '../views/catalog-thread-view.ts'
import {Board} from '../board.ts'
import * as boardCache from '../../cache/board-cache.ts'

export type ThreadTableIdentifier = string

export interface ThreadRow {
	id: number
	parent_id: number|null
	subject: string|null
	text: string
	user_name: string
	post_bump_count: number
	image_bump_count: number
	filename: string|null
	file_hash: Uint8Array|null
	file_path: string|null
	deleted: boolean
	created_at: Date
}

export async function getThreadById(boardSlug: string, postId: string): Promise<ThreadRow|null> {
	if (!Board.isValidBoardSlug(boardSlug)) {
		console.warn(`getThreadById passed illegal board slug "${boardSlug}"`)
		return null
	}

	if (!await boardCache.hasBoardForSlug(boardSlug)) {
		console.warn(`getThreadById passed slug for non-existent board "${boardSlug}"`)
		return null
	}

	return await db.oneOrNone(new PQ({text: `SELECT * FROM threads_${boardSlug} WHERE id = $2 AND deleted = false;`, values: [boardSlug, postId]}))
}

export async function getThreadWithReplies(boardSlug: string, threadId: number): Promise<Array<ThreadRow>> {
	if (!Board.isValidBoardSlug(boardSlug)) {
		console.warn(`getThreadWithReplies passed illegal board slug "${boardSlug}"`)
		return []
	}

	if (!await boardCache.hasBoardForSlug(boardSlug)) {
		console.warn(`getThreadWithReplies passed slug for non-existent board "${boardSlug}"`)
		return []
	}

	return await db.manyOrNone(new PQ({text: 'SELECT * FROM $1 WHERE deleted = false AND (id = $2 AND parent_id IS NULL) or (parent_id = $2) ORDER BY created_at ASC;', values: [boardSlug, threadId]}))
}

export async function createThread(boardSlug: string, thread: ThreadRow): Promise<ThreadRow|null> {
	if (!Board.isValidBoardSlug(boardSlug)) {
		console.warn(`createThread passed illegal board slug "${boardSlug}"`)
		return null
	}

	if (!await boardCache.hasBoardForSlug(boardSlug)) {
		console.warn(`createThread passed slug for non-existent board "${boardSlug}"`)
		return null
	}

	return await db.one(new PQ({
		text: `INSERT INTO threads_${boardSlug} (subject, text, user_name, filename, file_hash, file_path) VALUES ($1, $2, $3, $4, $5, $6);`,
		values: [thread.subject, thread.text, thread.user_name, thread.filename, thread.file_hash, thread.file_path]
	}))
}

export async function createReply(boardSlug: string, thread: ThreadRow): Promise<ThreadRow|null> {
	if (!Board.isValidBoardSlug(boardSlug)) {
		console.warn(`createThread passed illegal board slug "${boardSlug}"`)
		return null
	}

	if (!await boardCache.hasBoardForSlug(boardSlug)) {
		console.warn(`createThread passed slug for non-existent board "${boardSlug}"`)
		return null
	}
	
	return await db.one(new PQ({
		text: `INSERT INTO threads_${boardSlug} (parent_id, text, user_name, filename, file_hash, file_path)  VALUES ($1, $2, $3, $4, $5, $6);`,
		values: [thread.parent_id, thread.text, thread.user_name, thread.filename, thread.file_hash, thread.file_path]
	}))
}

/**
 * Get Catalog Page
 * @param threadTableName Table name of the thread
 * @param page
 */
export async function getCatalogPage(threadTableName: ThreadTableIdentifier, page: number|undefined = 0): Promise<Array<Thread>> {
	const threadPosts = await db.many<CatalogThreadView>(new PQ({
		text: `SELECT thread.id AS thread_id,
                      thread.subject AS thread_subject,
                      thread.text AS thread_text,
                      thread.user_name AS thread_user_name,
                      thread.post_bump_count AS thread_post_bump_count,
                      thread.image_bump_count AS thread_image_bump_count,
                      thread.filename AS thread_filename,
                      thread.file_hash AS thread_file_hash,
                      thread.file_path AS thread_file_path,
                      thread.created_at AS thread_created_at,
                      thread.bumped_at AS thread_bumped_at,
                      reply.id AS reply_id,
                      reply.text AS reply_text,
                      reply.user_name AS reply_user_name,
                      reply.filename AS reply_filename,
                      reply.file_path AS reply_file_path,
                      reply.file_hash AS reply_file_hash,
                      reply.created_at AS reply_created_at
FROM ${threadTableName} thread
JOIN LATERAL (
        SELECT * FROM ${threadTableName}
        WHERE parent_id = thread.id AND deleted = false
        ORDER BY created_at DESC LIMIT 4
    ) reply ON TRUE
ORDER BY thread.bumped_at DESC
OFFSET $1 * 10
LIMIT 10;`,
		values: [page]
	}))

	const threads: Array<Thread> = []
	let thread: Thread|undefined
	for (const threadPost of threadPosts) {
		if (!thread || threadPost.thread_id !== thread.id) {
			thread = {
				id: threadPost.thread_id,
				banned: false,
				bumpedAt: threadPost.thread_bumped_at,
				createdAt: threadPost.thread_created_at,
				imageBumpCount: threadPost.thread_image_bump_count,
				postBumpCount: threadPost.thread_post_bump_count,
				subject: threadPost.thread_subject,
				text: threadPost.thread_text,
				userIp: '',
				userName: threadPost.thread_user_name,
				deleted: false,
				posts: [{
					id: threadPost.reply_id,
					text: threadPost.reply_text,
					userIp: '',
					userName: threadPost.reply_user_name,
					deleted: false,
					banned: false,
					createdAt: threadPost.reply_created_at
				}]
			}

			threads.push(thread)
		}
	}

	return threads
}

export async function getThreadPostForBoardSlugAndNumber(boardSlug: string,  postNumber: number): Promise<ThreadRow|null|undefined> {
	if (!Board.isValidBoardSlug(boardSlug) || !boardCache.hasBoardForSlug(boardSlug)) {
		return undefined
	}

	return await db.oneOrNone<ThreadRow>(new PQ({
		text: `SELECT * FROM ${boardSlug}
WHERE id = $1;`,
		values: [postNumber]
	}))
}
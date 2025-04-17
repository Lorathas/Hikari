import {ObjectId} from "mongodb";
import {boards, client, getThreadCollectionForBoard} from "../db";
import {Mutex} from "async-mutex";
import {type Post, type Thread} from "../post";
import * as boardCache from '../../cache/board-cache'


const boardPostMutexes: {[board: string]: Mutex} = {}
const boardLastPostIds: {[board: string]: number} = {}

async function incrementId(boardId: ObjectId) {
    if (!boardLastPostIds.hasOwnProperty(boardId.toHexString())) {
        const board = await boardCache.getCachedBoardById(boardId)

        boardLastPostIds[boardId.toHexString()] = board.lastPostId
    }

    const id = boardLastPostIds[boardId.toHexString()]! + 1

    boardLastPostIds[boardId.toHexString()] = id

    return id
}

async function updateBoardId(boardId: ObjectId, lastPostId: number) {
    await boards.updateOne({_id: boardId}, {lastPostId})
}

function getBoardMutex(boardId: ObjectId) {
    if (!boardPostMutexes.hasOwnProperty(boardId.toHexString())) {
        boardPostMutexes[boardId.toHexString()] = new Mutex()
    }

    return boardPostMutexes[boardId.toHexString()]!
}

/**
 * Internal function for creating a thread
 * @param boardId ID of the board
 * @param thread Thread to create
 */
export async function createThreadInternal(boardId: ObjectId, thread: Thread): Promise<Thread> {
    const mutex = getBoardMutex(boardId)

    return await mutex.runExclusive(async () => {
        const session = client.startSession()

        try {
            session.startTransaction()

            const id = await incrementId(boardId)

            const time = new Date()

            const threads = await getThreadCollectionForBoard(boardId)

            const result = await threads.insertOne({
                id: id,
                subject: thread.subject,
                text: thread.text,
                createdAt: time,
                userId: thread.userId,
                userCountry: thread.userCountry,
                userIp: thread.userIp,
                deleted: thread.deleted,
                banned: thread.banned,
                postBumpCount: 0,
                imageBumpCount: 0,
                bumpedAt: time,
                posts: []
            })

            if (!result.acknowledged) {
                await session.abortTransaction()
                return Promise.reject('MongoDB failed to acknowledge thread creation')
            }

            await updateBoardId(boardId, id)

            await session.commitTransaction()

            return {
                id: id,
                subject: thread.subject,
                text: thread.text,
                createdAt: time,
                userId: thread.userId,
                userCountry: thread.userCountry,
                userIp: thread.userIp,
                deleted: thread.deleted,
                banned: thread.banned,
                postBumpCount: 0,
                imageBumpCount: 0,
                bumpedAt: time,
                posts: []
            }
        } catch (error) {
            console.error(error)
            await session.abortTransaction()
            throw error
        } finally {
            await session.endSession()
        }
    })
}

export async function createPostInternal(boardId: ObjectId, threadId: ObjectId, post: Post): Promise<Post> {
    const mutex = getBoardMutex(boardId)

    return await mutex.runExclusive(async () => {
        const session = client.startSession()

        try {
            session.startTransaction()

            const id = await incrementId(boardId)

            const time = new Date()
            
            const threads = await getThreadCollectionForBoard(boardId)

            const result = await threads.updateOne({_id: threadId}, {
                $push: {
                    posts: {
                id: id,
                text: post.text,
                createdAt: time,
                userId: post.userId,
                userCountry: post.userCountry,
                userIp: post.userIp,
                deleted: post.deleted,
                banned: post.banned
            }}})

            if (!result.acknowledged) {
                await session.abortTransaction()
                return Promise.reject('MongoDB failed to acknowledge post creation')
            }

            await updateBoardId(boardId, id)

            await session.commitTransaction()

            return {
                id: id,
                text: post.text,
                createdAt: time,
                userId: post.userId,
                userCountry: post.userCountry,
                userIp: post.userIp,
                deleted: post.deleted,
                banned: post.banned
            }
        } catch (error) {
            console.error(error)
            await session.abortTransaction()
            throw error
        } finally {
            await session.endSession()
        }
    })
}
import {AggregationCursor, ObjectId, type WithId} from "mongodb";
import {getThreadCollectionForBoard} from "../db";
import * as boardCache from '../../cache/board-cache'
import type Thread from "../thread";
import {clamp} from "../../util/math";

function aggregateQuery(boardId: ObjectId): any[] {
    return [
        {$sort: {bumpTime: -1}}
    ]
}

function pageQuery(replyLimit: number): any[] {
    return [
        {$match: {id: 1, deleted: false}},
        {
            $set: {
                posts: {
                    $slice: [
                        {
                            $sortArray: {
                                input: {
                                    $filter: {
                                        input: "$posts",
                                        as: "post",
                                        cond: {$eq: ["$$post.deleted", false]}
                                    }
                                },
                                sortBy: {createdAt: -1}
                            }
                        },
                        replyLimit
                    ]
                }
            }
        }
    ]
}

function threadForNumberQuery(threadNo: number): any[] {
    return [
        
    ]
}

export async function getPage(boardId: ObjectId, page: number = 0): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    page = clamp(page, 0, board.pageLimit - 1)

    const query = pageQuery(board.config.boardReplyLimit)
    query.push({$skip: page * board.pageSize})
    query.push({$limit: board.pageLimit})


    const threads = await getThreadCollectionForBoard(boardId)
    
    return await threads.aggregate<Thread>(query);
}

export async function getCatalog(boardId: ObjectId): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    const query = aggregateQuery(boardId)
    query.push({$limit: board.pageSize * board.pageLimit})

    const threads = await getThreadCollectionForBoard(boardId)
    
    return await threads.aggregate<Thread>(query);
}

export async function getThread(boardId: ObjectId, threadNo: number): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    const query = threadNumQuery(threadNo)

    const threads = await getThreadCollectionForBoard(boardId)

    return await threads.aggregate<Thread>(query)
}
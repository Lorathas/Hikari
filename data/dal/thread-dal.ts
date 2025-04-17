import {AggregationCursor, ObjectId, type WithId} from "mongodb";
import {getThreadCollectionForBoard} from "../db";
import * as boardCache from '../../cache/board-cache'
import {type Thread} from "../post";
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
                                sortBy: {createdAt: 1}
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

export async function getPage(boardId: ObjectId, page: number|undefined = undefined): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    const actualPage: number = page ?? 0
    
    page = clamp(actualPage, 0, board.pageLimit - 1)

    const query = pageQuery(board.config.query.boardReply)
    query.push({$skip: actualPage * board.config.pages.size})
    query.push({$limit: board.config.pages.limit})


    const threads = await getThreadCollectionForBoard(boardId)
    
    return await threads.aggregate<Thread>(query);
}

export async function getCatalog(boardId: ObjectId): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    const query = aggregateQuery(boardId)
    query.push({$limit: board.config.pages.size * board.config.pages.limit})

    const threads = await getThreadCollectionForBoard(boardId)
    
    return await threads.aggregate<Thread>(query);
}

export async function getThread(boardId: ObjectId, threadNo: number): Promise<AggregationCursor<Thread>> {
    const board = await boardCache.getCachedBoardById(boardId)

    const query = threadForNumberQuery(threadNo)

    const threads = await getThreadCollectionForBoard(boardId)

    return await threads.aggregate<Thread>(query)
}
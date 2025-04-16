import {BSON, Collection, MongoClient, ObjectId} from "mongodb"
import {Mutex} from "async-mutex";
import type Thread from "./thread";
import type Board from "./board";

export const client = new MongoClient(process.env.NERO_CONN_STRING)
export const db = client.db('test')

export const boards = db.collection<Board>('boards')

const boardThreadCollections: {[id: string]: Collection<Thread>} = {}

export async function getThreadCollectionForBoard(boardId: ObjectId): Promise<Collection<Thread>> {
	if (!boardThreadCollections.hasOwnProperty(boardId.toHexString())) {
		const board = await boards.findOne({_id: boardId})

		if (!board) {
			throw `Failed to fetch board for ID ${boardId.toHexString}`
		}

		boardThreadCollections[boardId.toHexString()] = db.collection<Thread>(`threads_${board!.slug}`)
	}

	return boardThreadCollections[boardId.toHexString()]!
}
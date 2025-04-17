import {Collection, MongoClient, ObjectId} from "mongodb"
import {type Thread} from "./post";
import {type BoardConfig, type Board} from "./board";

export const client = new MongoClient(process.env.HIKARI_CONN_STRING!)
export const db = client.db('hikari')

export const boardDefaults = db.collection<BoardConfig>('board_defaults')
export const boards = db.collection<Board>('boards')

const boardThreadCollections: {[id: string]: Collection<Thread>} = {}

export async function init() {
	for await (const board of boards.find()) {
		const boardThreadCollectionName = `threads_${board!.slug}`
		db.createCollection(boardThreadCollectionName)

		const threads = db.collection<Thread>(boardThreadCollectionName)

		boardThreadCollections[board._id.toHexString()] = threads
	}
}

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
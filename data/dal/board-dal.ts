import {type Board} from '../board'
import {ObjectId, type WithId} from 'mongodb'
import {boards} from '../db'

export function getById(boardId: ObjectId): Promise<WithId<Board>|null> {
	return boards.findOne({_id: boardId, isPublic: true})
}

export function getByName(boardName: string): Promise<WithId<Board>|null> {
	return boards.findOne({name: boardName, isPublic: true})
}

export function getBySlug(slug: string): Promise<WithId<Board>|null> {
	return boards.findOne({slug, isPublic: true})
}
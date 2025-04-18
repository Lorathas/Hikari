import { ObjectId, type WithId } from 'mongodb'
import type { Board } from '../../data/board'
import type { Thread } from '../../data/post'

export const mockThread: WithId<Thread> = {
	subject: '',
	posts: [],
	bumpedAt: new Date(),
	postBumpCount: 0,
	imageBumpCount: 0,
	userName: 'anonymous',
	id: 0,
	text: '',
	createdAt: new Date(),
	userIp: '',
	deleted: false,
	banned: false,
	_id: new ObjectId()
}

export const mockBoard: WithId<Board> = {
	_id: new ObjectId(),
	slug: '',
	name: '',
	description: '',
	lastPostId: 0,
	isPublic: true,
	config: {
		pages: {
			size: 0,
			limit: 0
		},
		fileSizes: {
			image: 0,
			video: 0
		},
		userCooldowns: {
			threads: 0,
			posts: 0,
			images: 0
		},
		bump: {
			posts: 0,
			images: 0
		},
		query: {
			boardReplies: 0
		}
	}
}
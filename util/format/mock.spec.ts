import { ObjectId, type WithId } from 'mongodb'
import type { BoardData } from '../../data/board'
import type { Thread } from '../../data/post'
import type {EmbedderContext} from './embed-formatter'
import {mock} from 'bun:test'
import type { ThreadPost } from '../../data/views/thread-post'

export const mockThread: WithId<Thread> = {
	id: 1,
	subject: '',
	posts: [
		{
			id: 2,
			text: '',
			userIp: '',
			userName: '',
			deleted: false,
			banned: false,
			createdAt: new Date()
		}
	],
	bumpedAt: new Date(),
	postBumpCount: 0,
	imageBumpCount: 0,
	userName: 'anonymous',
	text: '',
	createdAt: new Date(),
	userIp: '',
	deleted: false,
	banned: false,
	_id: new ObjectId()
}

export const mockBoard: WithId<BoardData> = {
	_id: new ObjectId(),
	slug: 'test',
	name: 'test',
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
			boardReply: 0
		}
	}
}

export const mockThreadPost: ThreadPost = {
	id: 3,
	subject: '',
	post: {
		id: 4,
		text: '',
		userIp: '',
		userName: '',
		deleted: false,
		banned: false,
		createdAt: new Date()
	},
	bumpedAt: new Date(),
	postBumpCount: 0,
	imageBumpCount: 0,
	userName: 'anonymous',
	text: '',
	createdAt: new Date(),
	userIp: '',
	deleted: false,
	banned: false,
}

export const mockEmbedderContext: EmbedderContext = {
	board: mockBoard,
	thread: mockThread,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	findThreadWithPostNumber: mock((postNumber: number) =>  {
		return Promise.resolve(mockThreadPost)
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	findThreadOnBoardWithPostNumber: mock((boardSlug: string, postNumber: number) => {
		return Promise.resolve(mockThreadPost)
	})
}

export const mockNotFoundEmbedderContext: EmbedderContext = {
	board: mockBoard,
	thread: mockThread,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	findThreadWithPostNumber: mock((postNumber: number) =>  {
		return Promise.resolve(undefined)
	}),
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	findThreadOnBoardWithPostNumber: mock((boardSlug: string, postNumber: number) => {
		return Promise.resolve(undefined)
	})
}
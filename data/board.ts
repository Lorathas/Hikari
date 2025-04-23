import { z } from 'zod'
import type {BoardRow} from './dal/board-dal.ts'
import type {ThreadTableIdentifier} from './dal/thread-dal.ts'

export const boardSlugRegex = /^[a-z0-9]+$/

export const PageConfigSchema = z.object({
	size: z.number().int(),
	limit: z.number().int()
})

export const FileSizeConfigSchema = z.object({
	image: z.number().int(),
	video: z.number().int()
})

export const UserCooldownConfigSchema = z.object({
	threads: z.number().int(),
	posts: z.number().int(),
	images: z.number().int(),
})

export const BumpLimitsConfigSchema = z.object({
	posts: z.number().int(),
	images: z.number().int()
})

export const QueryLimitsConfigSchema = z.object({
	boardReply: z.number().int()
})

export const BoardConfigSchema = z.object({
	pages: PageConfigSchema,
	fileSizes: FileSizeConfigSchema,
	userCooldowns: UserCooldownConfigSchema,
	bump: BumpLimitsConfigSchema,
	query: QueryLimitsConfigSchema
})

export const BoardDataSchema = z.object({
	id: z.number().int(),
	slug: z.string().regex(boardSlugRegex),
	name: z.string(),
	description: z.string(),
	lastPostId: z.number().int(),
	config: BoardConfigSchema,
	isPublic: z.boolean()
})

/**
 * Board class containing helper code needed for boards
 * Implements both BoardData and BoardRow for convenience
 */
export class Board implements BoardData, BoardRow {
	id: number
	slug: string
	name: string
	description: string
	lastPostId: number
	config: BoardConfig
	isPublic: boolean

	constructor(idOrData: number|BoardData|BoardRow, slug?: string, name?: string, description?: string, lastPostId?: number, config?: BoardConfig, isPublic?: boolean) {
		if (typeof idOrData === 'number') {
			if (!slug || !name || !description || !lastPostId || !config || !isPublic) {
				throw new Error('Invalid constructor call. If id is a number, all optional parameters must be supplied')
			}

			this.id = idOrData
			this.slug = slug
			this.name = name
			this.description = description
			this.lastPostId = lastPostId
			this.config = config
			this.isPublic = isPublic
			return
		}

		const res = BoardDataSchema.safeParse(idOrData)

		if (res.success) {
			this.id = res.data.id
			this.slug = res.data.slug
			this.name = res.data.slug
			this.description = res.data.slug
			this.lastPostId = res.data.lastPostId
			this.config = res.data.config
			this.isPublic = res.data.isPublic
			return
		}

		const row = idOrData as BoardRow

		this.id = row.id
		this.slug = row.slug
		this.name = row.name
		this.description = row.description
		this.lastPostId = row.last_post_id
		this.config = row.config
		this.isPublic = row.is_public
	}

	get threadTableName(): ThreadTableIdentifier {
		return `threads_${this.slug}`
	}

	get last_post_id(): number {
		return this.lastPostId
	}

	set last_post_id(value: number) {
		this.lastPostId = value
	}

	get is_public(): boolean {
		return this.isPublic
	}

	set is_public(value: boolean) {
		this.isPublic = value
	}

	static isValidBoardSlug(boardSlug: string): boolean {
		return boardSlugRegex.test(boardSlug)
	}
}

export type BoardData = z.infer<typeof BoardDataSchema>
export type BoardConfig = z.infer<typeof BoardConfigSchema>
export type PageConfig = z.infer<typeof PageConfigSchema>
export type FileSizeConfig = z.infer<typeof FileSizeConfigSchema>
export type BumpLimitsConfig = z.infer<typeof BumpLimitsConfigSchema>
export type UserCooldownConfig = z.infer<typeof UserCooldownConfigSchema>
export type QueryLimitsConfig = z.infer<typeof QueryLimitsConfigSchema>
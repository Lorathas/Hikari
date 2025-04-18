import { z } from 'zod'

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
	boardReplies: z.number().int()
})

export const BoardConfigSchema = z.object({
	pages: PageConfigSchema,
	fileSizes: FileSizeConfigSchema,
	userCooldowns: UserCooldownConfigSchema,
	bump: BumpLimitsConfigSchema,
	query: QueryLimitsConfigSchema
})

export const BoardSchema = z.object({
	slug: z.string().regex(/^[a-z0-9]+$/),
	name: z.string(),
	description: z.string(),
	lastPostId: z.number().int(),
	config: BoardConfigSchema,
	isPublic: z.boolean()
})

export type Board = z.infer<typeof BoardSchema>
export type BoardConfig = z.infer<typeof BoardConfigSchema>
export type PageConfig = z.infer<typeof PageConfigSchema>
export type FileSizeConfig = z.infer<typeof FileSizeConfigSchema>
export type BumpLimitsConfig = z.infer<typeof BumpLimitsConfigSchema>
export type UserCooldownConfig = z.infer<typeof UserCooldownConfigSchema>
export type QueryLimitsConfig = z.infer<typeof QueryLimitsConfigSchema>
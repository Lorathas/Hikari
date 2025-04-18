import type { z } from 'zod'
import { PostSchema, ThreadSchema } from '../post'

export const ThreadPostSchema = ThreadSchema
	.omit({posts: true})
	.extend({
		post: PostSchema
	})

export type ThreadPost = z.infer<typeof ThreadPostSchema>
import {z} from 'zod'

export const MessageType = z.enum(['PostCreated', 'PostDeleted', 'SubscribeToThread'])

export const HikariWebSocketMessageSchema = z.object({
	type:  MessageType
})

export type HikariWebSocketMessage = z.infer<typeof HikariWebSocketMessageSchema>

export const PostCreatedMessageSchema = HikariWebSocketMessageSchema.extend({
	postHtml: z.string()
})

export type PostCreatedMessage =  z.infer<typeof PostCreatedMessageSchema>

export const PostDeletedMessageSchema =  HikariWebSocketMessageSchema.extend({
	postNumber: z.number().int()
})

export type PostDeletedMessage =  z.infer<typeof PostDeletedMessageSchema>

export const SubscribeToThreadMessageSchema = HikariWebSocketMessageSchema.extend({
	threadNumber: z.number().int()
})

export type SubscribeToThreadMessage =  z.infer<typeof SubscribeToThreadMessageSchema>
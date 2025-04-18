import { z } from "zod"

export const PostSchema = z.object({
    id: z.number().int(),
    text: z.string(),
    userIp: z.string().cidr(),
    userId: z.string().optional(),
    userCountry: z.string().optional(),
    userName: z.string(),
    deleted: z.boolean(),
    banned: z.boolean(),
    createdAt: z.date(),
})

export const ThreadSchema = PostSchema.extend({
    subject: z.string().max(128),
    postBumpCount: z.number().int(),
    imageBumpCount: z.number().int(),
    posts: z.array(PostSchema),
    bumpedAt: z.date()
})

export const CreatePostSchema = PostSchema.omit({
    createdAt: true,
    userIp: true,
    userId: true,
    deleted: true,
    banned: true
})

export const CreateThreadSchema = ThreadSchema.omit({
    createdAt: true,
    userIp: true,
    userId: true,
    deleted: true,
    banned: true,
    postBumpCount: true,
    imageBumpCount: true,
    posts: true,
    bumpedAt: true
})

export type Post = z.infer<typeof PostSchema>
export type Thread = z.infer<typeof ThreadSchema>

export type CreatePost = z.infer<typeof CreatePostSchema>
export type CreateThread = z.infer<typeof CreateThreadSchema>
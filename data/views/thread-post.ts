import type { Post } from "../post";

export default interface ThreadPost extends Post {
    subject: string
    post: Post
    bumpedAt: Date
    postBumpCount: number
    imageBumpCount: number
    userName?: string
}
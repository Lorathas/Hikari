import type Post from "./post";

export default interface Thread extends Post {
    subject: string
    posts: Post[]
    bumpTime: Date
    postBumpCount: number
    imageBumpCount: number
    userName?: string
}
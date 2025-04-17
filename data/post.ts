export interface Post {
    id: number
    text: string
    createdAt: Date
    userIp: string
    userId?: string
    userCountry?: string
    deleted: boolean
    banned: boolean
}

export interface Thread extends Post {
    subject: string
    posts: Post[]
    bumpedAt: Date
    postBumpCount: number
    imageBumpCount: number
    userName?: string
}
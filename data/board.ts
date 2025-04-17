export interface Board {
    slug: string
    name: string
    description: string
    lastPostId: number
    config: BoardConfig
    isPublic: boolean,
    pageSize: number,
    pageLimit: number
}

export interface BoardConfig {
    pages: PageConfig
    fileSizes: FileSizeConfig
    userCooldowns: UserCooldownConfig
    bump: BumpLimitsConfig
    query: QueryLimitsConfig
}

export interface PageConfig {
    size: number
    limit: number
}

export interface FileSizeConfig {
    image: number
    video: number
}

export interface BumpLimitsConfig {
    posts: number
    threads: number
}

export interface UserCooldownConfig {
    threads: number
    posts: number
    images: number
}

export interface QueryLimitsConfig {
    boardReply: number
}
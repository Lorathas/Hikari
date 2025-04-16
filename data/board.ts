export default interface Board {
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
    maxImageSize: number
    maxVideoSize: number
    userThreadCooldown: number
    userPostCooldown: number
    userImagePostCooldown: number

    postBumpLimit: number
    imageBumpLimit: number

    boardReplyLimit: number
}
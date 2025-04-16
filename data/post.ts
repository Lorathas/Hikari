export default interface Post {
    id: number
    text: string
    createdAt: Date
    userIp: string
    userId?: string
    userCountry?: string
    deleted: boolean
    banned: boolean
}
export interface Post {
    postId: number
    floorNumber: number
    createdAtUtc: number
    userId: string
    isPostOwner: boolean
    content: string

    imageUrl?: string
}
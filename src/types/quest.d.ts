import type { Post } from "./post";

export interface Quest {
    baseUrl: string
    lfsBaseUrl: string

    folder: string
    name: string

    postOwner: string

    // TODO: 分成 fragment，即 Map<number, Post[]>
    posts: Post[] | null

    // postId -> floorNumber
    idFloorLookup: Map<number, number>
}
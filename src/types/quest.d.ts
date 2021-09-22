import type { RawPostJson } from "./post";

export interface Quest {
    baseUrl: string

    folder: string
    name: string

    postOwner: string

    // TODO: 分成 fragment，即 Map<number, Post[]>
    posts: RawPostJson[] | null
}
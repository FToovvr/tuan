<script setup lang="ts">
// import type { Post } from '~/types/post'

// type Props = Post
// const props = defineProps<Props>()
interface Props {
    postId: number
    floorNumber: number
    createdAtUtc: number
    userId: string
    isPostOwner: boolean
    content: string

    imageUrl?: string
}
const props = defineProps<Props>()

let createdAtUtc = $(toRef(props, 'createdAtUtc'))

let createdAt = $computed(() => {
    const createdAtUtc8 = createdAtUtc + 60 * 60 * 80;
    const isoString = (new Date(createdAtUtc8 * 1000)).toISOString()
    const [datePart, otherPart] = isoString.split('T')
    const [timePart] = otherPart.split('.')
    return `${datePart} ${timePart}`
})

</script>

<template lang="pug">
article.container(w:m="y-2")
    div(w:p="x-2 y-4" w:bg="orange-100 dark:cyan-900" class="rounded-md")
        div(w:p="x-4")
            div(w:font="mono" w:text="sm")
                div(w:float="left")
                    //- PO
                    span(:class="isPostOwner ? 'font-black' : 'font-normal'") {{ userId }}
                    |
                    //- 发串时间
                    | {{ createdAt }}
                div(w:float="right")
                    span No.{{ postId }}
                    span(w:text="xs")
                        | (
                        //- FIXME: alias `anchor-link` 不运作？
                        a.anchor-link(:href="'#' + floorNumber") \#{{ floorNumber }}
                        | )
            //- TODO: 标题和名称
            div(w:clear="both")
            //- 分割头部信息与正文
            hr(w:m="t-2 b-3 x-0.5" w:border="dashed gray-400")
            div
                //- 附图（右侧）
                div(
                    v-if="imageUrl"
                    w:float="right"
                )
                    quest-post-image(:image-url="imageUrl")
                //- 正文
                quest-post-content(:content="content")
            div(w:clear="both")
</template>

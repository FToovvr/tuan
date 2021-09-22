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
article.container(
    w:m="b-2" w:p="x-6 b-3" w:bg="orange-100 dark:cyan-900" class="rounded-md"
    :id="'floor-' + floorNumber"
    )

    div(class="h-2")

    //- 头部
    div(w:font="mono" w:text="sm" class="sticky top-0")
        div(w:p="t-1" w:bg="orange-100 dark:cyan-900")
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
                    a.anchor-link(:href="'#floor-' + floorNumber") \#{{ floorNumber }}
                    | )
            div(w:clear="both")
            div(class="h-1")
            //- TODO: 标题和名称

            hr(w:m="x-0.5" w:border="dashed gray-400")

    div(class="h-3")

    //- 正文（+附图）
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

    div(class="h-1")

</template>

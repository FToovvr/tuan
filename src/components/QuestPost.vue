<script setup lang="ts">
import type { Post } from "~/types/post"
import { useStuffStore } from "~/stores/stuff"

interface Props {
    post?: Post // 帖内容或帖号
    postId?: number

    nestLevel?: number
}
const props = defineProps<Props>()
let isRefPost = $computed(() => props.nestLevel ?? 0 > 0)

const stuffStore = useStuffStore()

let postContentDiv: HTMLDivElement | null = $ref(null)
let refRelativeDivId: number | null = $ref(null)
onMounted(() => {
    // provide('ref-relative-div', $$(postContentDiv))
    refRelativeDivId = stuffStore.nextRefRelativeDivId
    stuffStore.nextRefRelativeDivId++
    if (postContentDiv) {
        postContentDiv.id = `ref-relative-div-${refRelativeDivId}`
    }
})


let post = $((() => {
    if (props.post) {
        return computed(() => props.post as Post)
    }
    return computed(() => {
        const floorNumber = stuffStore.currentQuest!.idFloorLookup.get(props.postId!)!
        if (!floorNumber) {
            //- TODO: 处理 post 不存在的情况
            console.debug(`串 ${props.postId} 不存在于数据中`)
            return null
        }
        return stuffStore.currentQuest!.posts![floorNumber - 1]
    })
})())

let createdAt = $computed(() => {
    const createdAtUtc8 = post!.createdAtUtc + 60 * 60 * 80;
    const isoString = (new Date(createdAtUtc8 * 1000)).toISOString()
    const [datePart, otherPart] = isoString.split('T')
    const [timePart] = otherPart.split('.')
    return `${datePart} ${timePart}`
})

</script>

<template lang="pug">
article.container(
    v-if="post"
    :id="'floor-' + post.floorNumber"
    w:m="y-1" w:bg="orange-100 dark:cyan-900"
    w:border="2 dark:(1 gray)"
    :class="isRefPost ? 'border-gray-400 pb-2 px-3' : 'pt-2 pb-3 px-6'"
    class="rounded-md"
    )

    //- 头部
    div(w:font="mono" w:text="sm" class="sticky top-0" style="z-index: 1;")
        div(w:p="t-1" w:bg="orange-100 dark:cyan-900")
            div(w:float="left")
                //- PO
                span(:class="post.isPostOwner ? 'font-black' : 'font-normal'") {{ post.userId }}
                |
                //- 发串时间
                | {{ createdAt }}
                span(class="px-3")
            div(w:float="right")
                span No.{{ post.postId }}
                span(w:text="xs")
                    | (
                    //- FIXME: alias `anchor-link` 不运作？
                    a.anchor-link(:href="'#floor-' + post.floorNumber") \#{{ post.floorNumber }}
                    | )
            div(w:clear="both")
            div(class="h-1")
            //- TODO: 标题和名称

            hr(w:m="x-0.5" w:border="dashed gray-400")

    div(:class="isRefPost ? 'h-1' : 'h-3'")

    //- 正文（+附图）
    div.relative(ref="postContentDiv")
        //- 附图（右侧）
        div(
            v-if="post.imageUrl"
            w:float="right"
        )
            quest-post-image(:image-url="post.imageUrl")
        //- 正文
        quest-post-content(:content="post.content" :ref-relative-div-id="refRelativeDivId", :nest-level="nestLevel ?? 0")
    div(w:clear="both")

</template>

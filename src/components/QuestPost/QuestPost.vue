<script setup lang="ts">

import type { Post } from "~/types/post"
import { useStuffStore } from "~/stores/stuff"
import { postBackgroundColor } from "~/logic/backgroundColor"

interface Props {
    post?: Post // 帖内容或帖号
    postId?: number

    nestLevel?: number
    isCollapsed?: boolean
}
const props = defineProps<Props>()
let isRefPost = $computed(() => props.nestLevel ?? 0 > 0)

const emit = defineEmits(['expand'])

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
        return toRef(props, 'post')
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

function onClick(ev: Event) {
    if (props.isCollapsed) {
        emit('expand')
        ev.stopPropagation()
    }
}

</script>

<template lang="pug">
article.quest-post.container.relative(
    v-if="post"
    :id="'id-' + post.postId"
    w:border="1 dark:gray"
    :class="(isRefPost ? '!border-gray-400 pb-2 px-3' : 'pt-2 pb-3 px-6') + ' ' + (props.isCollapsed ? 'max-h-24 overflow-hidden' : '')"
    class="rounded-md"
)

    .quest-post-wrapper

        overflow-mask(
            v-if="isCollapsed"
            @click.capture="onClick"
            :background-color-rgb-hex="postBackgroundColor"
        )

        //- 头部
        div(w:text="sm" class="sticky top-0" style="z-index: 1;")
            .quest-post-head(w:p="t-1")
                div(w:float="left")
                    //- 作为引用视图时，图钉等操作图标放这里
                    slot(name='head-left')
                    //- PO
                    span(w:font="mono" :class="post.isPostOwner ? 'font-black' : 'font-normal'") {{ post.userId }}
                    span(class="px-1.5")
                    //- 发串时间
                    span(w:font="mono") {{ createdAt }}
                    span(class="px-3")
                div(w:font="mono" w:float="right")
                    span No.{{ post.postId }}
                    span(w:text="xs")
                        | (
                        //- FIXME: alias `anchor-link` 不运作？
                        a.anchor-link(:href="'#id-' + post.postId") \#{{ post.floorNumber }}
                        | )
                div(w:clear="both")
                div(class="h-1")
                //- TODO: 标题和名称

                hr(w:m="x-0.5" w:border="dashed gray-400")

        div(:class="isRefPost ? 'h-1' : 'h-3'")

        //- 正文（+附图）
        .relative(
            ref="postContentDiv"
            @click.capture="onClick"
        )
            //- 附图（右侧）
            div(v-if="post.imageUrl")
                quest-post-image(:image-url="post.imageUrl" :background-color-rgb-hex="postBackgroundColor")
            //- 正文
            quest-post-content(:content="post.content" :ref-relative-div-id="refRelativeDivId", :nest-level="nestLevel ?? 0")

        div(w:clear="both")

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(postBackgroundColor);
}
</style>
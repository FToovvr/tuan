<script setup lang="ts">

import type { Post } from "~/types/post"
import QuestPostFrame from "./QuestPostFrame.vue"
import { postBackgroundColor } from "~/logic/backgroundColor"
import { postContentDivKey } from "~/logic/injectKeys"

interface Props {
    post: Post // 帖内容或帖号

    nestLevel: number
    isCollapsed: boolean
}
const props = defineProps<Props>()
let isRefPost = $computed(() => (props.nestLevel) > 0)

const emit = defineEmits(['expand'])

let postContentDiv: HTMLDivElement | null = $ref(null)
provide(postContentDivKey, readonly($$(postContentDiv)))

let post = $(toRef(props, 'post'))

let createdAt = $computed(() => {
    const createdAtUtc8 = post!.createdAtUtc + 60 * 60 * 80;
    const isoString = (new Date(createdAtUtc8 * 1000)).toISOString()
    const [datePart, otherPart] = isoString.split('T')
    const [timePart] = otherPart.split('.')
    return `${datePart} ${timePart}`
})

</script>

<template lang="pug">
quest-post-frame(
    v-if="post"
    :id="isRefPost ? undefined : 'id-' + post.postId"
    :is-ref-post="isRefPost" :is-collapsed="isCollapsed" :background-color-rgb-hex="postBackgroundColor"
    @expand="emit('expand')"
)

    template(#head)
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

        //- TODO: 标题和名称


    template(#content)
        div(ref="postContentDiv")
            //- 附图（右侧）
            div(v-if="post.imageUrl")
                quest-post-image(:image-url="post.imageUrl" :background-color-rgb-hex="postBackgroundColor")
            //- 正文
            quest-post-content(:content="post.content" :nest-level="nestLevel ?? 0")

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(postBackgroundColor);
}
</style>
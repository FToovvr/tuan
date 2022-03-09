<script setup lang="ts">

import type { Post } from "~/logic/post"
import { rawPostToPost } from "~/logic/post"
import type { DisplayStatus } from "~/types/post-ui"
import { useStuffStore } from "~/stores/stuff"
import { postBackgroundColor } from "~/logic/backgroundColor"
import { isInsideCollapsedKey } from "~/logic/injectKeys"
import QuestPostFrame from "./QuestPostFrame.vue"

interface Props {
    post?: Post // 帖内容或帖号
    postId?: number

    nestLevel?: number
    displayStatus?: DisplayStatus
}
const props = withDefaults(defineProps<Props>(), {
    displayStatus: 'open'
})

const emit = defineEmits(['expand'])

let isInsideCollapsed = $(inject(isInsideCollapsedKey, ref(false)))
let innerIsInsideCollapsed = $computed(() => isInsideCollapsed || props.displayStatus === 'collapsed')
provide(isInsideCollapsedKey, readonly($$(innerIsInsideCollapsed)))

const stuffStore = useStuffStore()

let post: Post | 'lost' | 'loading' = $ref('loading')

watch(props, () => {
    if (props.post) {
        post = props.post
        return
    }
    new Promise(async () => {
        const _post = await stuffStore.currentQuest!.getRefPost(props.postId!)
        if (!_post) {
            //- TODO: 处理 post 不存在的情况
            console.debug(`串 ${props.postId} 不存在于数据中`)
            post = 'lost'
            return
        }
        const currentQuest = stuffStore.currentQuest!
        post = rawPostToPost(_post, currentQuest, currentQuest.postFloorLookup.get(_post.id)!)
    })
}, { immediate: true })

</script>

<template lang="pug">
template(v-if="post === 'loading' || post === 'lost'")
    quest-post-frame(
        :nest-level="nestLevel ?? 0" :display-status="displayStatus" :background-color-rgb-hex="postBackgroundColor"
        @expand="emit('expand')"
        v-bind="$attrs"
    )
        template(#head)
            div(w:float="left")
                slot(name="head-left")
            div(w:font="mono" w:float="right")
                span No.{{ postId }}
        template(#content)
            span(v-if="post === 'lost'" w:text="rose-600 bold")
                span(w:text="lg") 本串号对应内容未被收录…
                br
                span(w:text="sm") 此内容可能来自其他串，或在收录前就已消失。
            span(v-else w:text="gray-400 bold") 加载中…
template(v-else)
    quest-post(
        :post="post" :nest-level="nestLevel ?? 0" :display-status="displayStatus"
        @expand="emit('expand')"
        v-bind="$attrs"
    )
        template(#head-left)
            slot(name="head-left")
</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(postBackgroundColor);
}
</style>
<script setup lang="ts">

import type { Post } from "~/types/post"
import { useStuffStore } from "~/stores/stuff"
import { postBackgroundColor } from "~/logic/backgroundColor"
import QuestPostFrame from "./QuestPostFrame.vue"

interface Props {
    post?: Post // 帖内容或帖号
    postId?: number

    nestLevel?: number
    isCollapsed?: boolean
}
const props = defineProps<Props>()

const emit = defineEmits(['expand'])

const stuffStore = useStuffStore()

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

</script>

<template lang="pug">
template(v-if="post")
    quest-post(
        :post="post" :nest-level="nestLevel ?? 0" :is-collapsed="isCollapsed ?? false"
        @expand="emit('expand')"
        v-bind="$attrs"
    )
        template(#head-left)
            slot(name="head-left")
template(v-else)
    quest-post-frame(
        :nest-level="nestLevel ?? 0" :is-collapsed="isCollapsed ?? false" :background-color-rgb-hex="postBackgroundColor"
        @expand="emit('expand')"
        v-bind="$attrs"
    )
        template(#head)
            div(w:float="left")
                slot(name="head-left")
            div(w:font="mono" w:float="right")
                span No.{{ postId }}
        template(#content)
            span(w:text="rose-600 bold")
                span(w:text="lg") 本串号对应内容未被收录…
                br
                span(w:text="sm") 此内容可能来自其他串，或在收录前就已消失。
</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(postBackgroundColor);
}
</style>
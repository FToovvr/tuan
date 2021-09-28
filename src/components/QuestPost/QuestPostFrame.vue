<script setup lang="ts">
import zIndexes from '~/logic/zIndexes'
import { postContentDivKey } from "~/logic/injectKeys"

interface Props {
    isRefPost: boolean
    isCollapsed: boolean
    backgroundColorRgbHex: string
}
const props = defineProps<Props>()

const emit = defineEmits(['expand'])

let postContentDivRef: HTMLDivElement | null = $ref(null)
provide(postContentDivKey, readonly($$(postContentDivRef)))

function tryExpanding(ev: Event) {
    // TODO: 点击内部固定的引用视图，如果对应内部视图没有触发操作，则展开外部视图自身
    if (props.isCollapsed) {
        emit('expand')
        if (ev.target instanceof HTMLElement && ev.target.classList.contains('ref-post-link')) {
            // 不 stopPropagation
            // TODO: 考虑其他适用情况？比如链接，甚至任意交互行为？
        } else {
            ev.stopPropagation()
        }
    }
}

const headZIndex = zIndexes.postHead

</script>

<template lang="pug">
article.quest-post.container.relative(
    w:border="1 dark:gray"
    :class="isRefPost ? '!border-gray-400 px-3' : 'pt-2 px-6'"
    class="rounded-md"
)

    .quest-post-wrapper

        //- 头部
        .quest-post-head(w:text="sm" class="sticky top-0" w:p="t-1")
            slot(name="head")
            div(w:clear="both")
            div(class="h-1")
            hr(w:m="x-0.5" w:border="dashed gray-400")

        div(:class="isRefPost ? 'h-1' : 'h-3'")

        //- 正文（+附图）
        .relative(ref="postContentDivRef")
            overflow-mask(
                v-if="isCollapsed"
                @click.capture="tryExpanding"
                :background-color-rgb-hex="backgroundColorRgbHex"
                z-index
            )
            div(:class="isCollapsed ? 'max-h-15 overflow-hidden' : undefined")
                .quest-post-content-wrapper
                    .relative.quest-post-ref-wrapper
                    div(@click.capture="tryExpanding")
                        slot(name="content")
                        div(:class="isRefPost ? 'h-2' : 'h-3'")

        div(w:clear="both")

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(backgroundColorRgbHex);
}

.quest-post-head {
    z-index: v-bind(headZIndex);
}
</style>
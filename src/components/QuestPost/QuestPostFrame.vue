<script setup lang="ts">

import type { DisplayStatus } from '~/types/post-ui'
import zIndexes from '~/logic/zIndexes'
import { postContentDivKey } from "~/logic/injectKeys"

interface Props {
    nestLevel: number
    displayStatus: DisplayStatus
    backgroundColorRgbHex: string
}
const props = defineProps<Props>()
let isRefPost = computed(() => props.nestLevel > 0)

const emit = defineEmits(['expand'])

let postContentDivRef: HTMLDivElement | null = $ref(null)
provide(postContentDivKey, readonly($$(postContentDivRef)))

function tryExpanding(ev: Event) {
    // TODO: 点击内部固定的引用视图，如果对应内部视图没有触发操作，则展开外部视图自身
    if (props.displayStatus === 'collapsed') {
        emit('expand')
        if (ev.target instanceof HTMLElement && ev.target.classList.contains('ref-post-link')) {
            // 不 stopPropagation
            // TODO: 考虑其他适用情况？比如链接，甚至任意交互行为？
        } else {
            ev.stopPropagation()
        }
    }
}

let top = $(inject('offsetTop', ref(0)))
let height = $ref(0)
let currentBottom: number | null = $ref(null)
let fullBottom = $computed(() => top + height)
let childTop = $computed(() => Math.max(currentBottom ?? fullBottom, top))
provide('offsetTop', readonly($$(childTop)))

let sentinelDiv: HTMLDivElement | null = $ref(null)

let headRef: HTMLElement | null = $ref(null);
onMounted(() => {
    height = headRef!.getBoundingClientRect().height

    const onScroll = (ev: Event) => {
        // TODO: 更优雅地去除此事件监听器，防止内存泄漏/无益地占用 CPU
        if (!headRef) {
            window.removeEventListener('scroll', onScroll)
            return
        }
        const rect = headRef!.getBoundingClientRect()
        if (rect.top < -height) {
            window.removeEventListener('scroll', onScroll)
            currentBottom = height
            return
        }
        currentBottom = rect.bottom
    }
    useIntersectionObserver(sentinelDiv, ([{ intersectionRatio }]) => {
        if (headRef!.getBoundingClientRect().top > height) {
            return
        }
        if (intersectionRatio === 1) {
            window.removeEventListener('scroll', onScroll)
            currentBottom = null
        } else if (intersectionRatio === 0) {
            window.removeEventListener('scroll', onScroll)
            currentBottom = 0
        } else {
            window.addEventListener('scroll', onScroll)
        }
    }, { threshold: [0, 1] })
})

let headZIndex = zIndexes.postHead

</script>

<template lang="pug">
article.quest-post.container.relative(
    w:border="1 dark:gray"
    :class="isRefPost ? '!border-gray-400 px-1' : 'px-4 pt-0.5'"
    class="rounded-md"
)

    .quest-post-wrapper.relative

        //- 头部
        //- FIXME: 解决用户可能会混淆固定的帖以及悬浮的帖之间的头部的问题
        .quest-post-head(
            class="sticky"
            ref="headRef"
            w:text="sm" w:p="t-1"
            :style="{ top: `${top}px` }"
        )
            slot(name="head")
            div(w:clear="both")
            div(class="h-1")
            hr(w:m="x-0.5" w:border="dashed gray-400")

        div(:class="isRefPost ? 'h-1.5' : 'h-1'")

        //- 正文（+附图）
        .relative(ref="postContentDivRef")
            overflow-mask(
                v-if="displayStatus === 'collapsed'"
                @click.capture="tryExpanding"
                :background-color-rgb-hex="backgroundColorRgbHex"
                z-index
            )
            div(:class="displayStatus === 'collapsed' ? 'max-h-15 overflow-hidden' : undefined")
                .quest-post-content-wrapper
                    .relative.quest-post-ref-wrapper
                    div(
                        @click.capture="tryExpanding"
                        :class="isRefPost ? 'px-2' : 'px-2'"
                    )
                        slot(name="content")
                        div(:class="isRefPost ? 'h-2' : 'h-3'")

        div(w:clear="both")
        div(
            ref="sentinelDiv"
            style="position: absolute; left: 0; right: 0; visibility: hidden;"
            :style="{ height: `${fullBottom}px`, bottom: `${0}px` }"
        )

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(backgroundColorRgbHex);
}

.quest-post-head {
    height: max-content;
    z-index: v-bind(headZIndex);
}
</style>
<script setup lang="ts">
import type { Ref } from 'vue'

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

let headRef: HTMLElement | null = $ref(null)

let top = $(inject('offsetTop', ref(0)))
let height = $ref(0)
onMounted(() => useResizeObserver(headRef, ([e]) => height = e.contentRect.height))

// 若此 Div 部分接触到 viewport 上方边缘，代表头部被遮盖
// 部分参考 https://developers.google.com/web/updates/2017/09/sticky-headers
let sentinelDiv: HTMLElement | null = $ref(null)

let { childTop } = $(function useMultipleLevelSticky(
    _headRef: Ref<HTMLElement | null>, _sentinelDiv: Ref<HTMLElement | null>,
    _top: Ref<number>, _height: Ref<number>
) {
    let sentinelDiv = $(_sentinelDiv)
    let headRef = $(_headRef)
    let top = $(_top)
    let height = $(_height)

    let currentBottom: number | null = $ref(null)
    let fullBottom = $computed(() => top + height)
    let childTop = $computed(() => Math.max(currentBottom ?? fullBottom, top))

    let headVisibility: 'aboveScreen' | 'onScreen' | 'partiallyCoveredByTopEdge' | null = $ref(null)

    const onScroll = (ev: Event) => {
        // TODO: 更优雅地去除此事件监听器，防止内存泄漏/无益地占用 CPU
        if (!headRef) {
            window.removeEventListener('scroll', onScroll)
            return
        }
        const rect = headRef!.getBoundingClientRect()
        currentBottom = rect.bottom
    }
    onUnmounted(() => window.removeEventListener('scroll', onScroll))

    onMounted(() =>
        useIntersectionObserver(sentinelDiv, ([{ intersectionRatio }]) => {
            const sentinelRect = sentinelDiv!.getBoundingClientRect()
            if (sentinelRect.top > 0 && sentinelRect.bottom > window.innerHeight / 2) {
                // 自下方而来
                return
            }
            if (intersectionRatio === 1) {
                headVisibility = 'onScreen'
            } else if (intersectionRatio === 0) {
                if (headVisibility === 'aboveScreen') {
                    // FIXME: 不知为何第二层起进入屏幕时 observer 会触发第二次 0，故作此 workaround
                    headVisibility = 'partiallyCoveredByTopEdge'
                } else {
                    headVisibility = 'aboveScreen'
                }
            } else {
                headVisibility = 'partiallyCoveredByTopEdge'
            }
        }, { threshold: [0, 1] })
    )

    watch($$(headVisibility), () => {
        switch (headVisibility) {
            case 'onScreen': {
                window.removeEventListener('scroll', onScroll)
                currentBottom = null
            }
                break
            case 'aboveScreen': {
                window.removeEventListener('scroll', onScroll)
                currentBottom = 0
            }
                break
            case 'partiallyCoveredByTopEdge': {
                window.addEventListener('scroll', onScroll)
            }
                break
        }
    })

    return { childTop: $$(childTop) }

}($$(headRef), $$(sentinelDiv), $$(top), $$(height)))

provide('offsetTop', readonly($$(childTop)))

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
        .quest-post-head.sticky(
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
            :style="{ height: `${height}px`, bottom: `${top}px` }"
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
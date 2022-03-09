<script setup lang="ts">

import type { Post } from "~/logic/post"
import type { DisplayStatus } from "~/types/post-ui"
import { postBackgroundColor } from "~/logic/backgroundColor"
import { currentPageNumberKey, currentPostIdKey, pageNumberKey } from "~/logic/injectKeys"
import { useStuffStore } from "~/stores/stuff"

import QuestPostFrame from "./QuestPostFrame.vue"

interface Props {
    post: Post // 帖内容或帖号

    nestLevel: number
    displayStatus: DisplayStatus
}
const props = defineProps<Props>()
let isRefPost = $computed(() => (props.nestLevel) > 0)

const emit = defineEmits(['expand'])

let pageNumber = $(inject(pageNumberKey))

let post = $(toRef(props, 'post'))

const stuffStore = useStuffStore()

let createdAt = $computed(() => {
    const createdAtUtc8 = post!.createdAtUtc + 60 * 60 * 80;
    const isoString = (new Date(createdAtUtc8 * 1000)).toISOString()
    const [datePart, otherPart] = isoString.split('T')
    const [timePart] = otherPart.split('.')
    return `${datePart} ${timePart}`
})

// @ts-ignore … is declared but its value is never read.
let currentPageNumber = $(inject(currentPageNumberKey))
// @ts-ignore … is declared but its value is never read.
let currentPostId = $(inject(currentPostIdKey))
let topSentinelDiv: HTMLElement | null = $ref(null)
let bottomSentinelDiv: HTMLElement | null = $ref(null)
onMounted(() => {
    if (props.nestLevel > 0) { return }
    // 只为主帖
    // TODO: 合并两个 IntersectionObserver？
    let topFisrtTime = true
    useIntersectionObserver($$(topSentinelDiv), ([{ intersectionRatio, boundingClientRect: { y } }]) => {
        if (topFisrtTime) { topFisrtTime = false; return }
        if (stuffStore.isInAutoScrolling) { return }
        if (intersectionRatio < 1 && topSentinelDiv!.getBoundingClientRect().top < 0) {
            if (pageNumber) {
                // @ts-ignore 类型推断有问题
                currentPageNumber = pageNumber
            }
            // @ts-ignore 类型推断有问题
            currentPostId = post.postId
        }
    }, { threshold: 1 })
    let previousBottomY: number | null = null
    useIntersectionObserver($$(bottomSentinelDiv), ([{ intersectionRatio, boundingClientRect: { y } }]) => {
        if (previousBottomY === null || previousBottomY > window.innerHeight) {
            previousBottomY = y
            return
        }
        previousBottomY = y
        if (stuffStore.isInAutoScrolling) { return }
        if (intersectionRatio === 1) {
            if (pageNumber) {
                // @ts-ignore 类型推断有问题
                currentPageNumber = pageNumber
            }
            // @ts-ignore 类型推断有问题
            currentPostId = post.postId
        }
    }, { threshold: 1 })
})

onMounted(() => {
    if (props.nestLevel === 0) {
        nextTick(() => {
            const sutffStore = useStuffStore()
            if (sutffStore.postToScrollTo === props.post.postId) {
                topSentinelDiv!.scrollIntoView()
                sutffStore.postToScrollTo = null
            }
        })
    }
})

</script>

<template lang="pug">
div
    div(ref="topSentinelDiv")
    quest-post-frame(
        v-if="post"
        :id="isRefPost ? undefined : 'id-' + post.postId"
        :nest-level="nestLevel" :display-status="displayStatus" :background-color-rgb-hex="postBackgroundColor"
        @expand="emit('expand')"
        v-bind="$attrs"
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
            div
                //- 附图（右侧）
                div(v-if="post.imageUrl")
                    quest-post-image(:image-url="post.imageUrl" :background-color-rgb-hex="postBackgroundColor")
                //- 正文
                quest-post-content(:content="post.content" :nest-level="nestLevel ?? 0")
                .clear-both
    div(ref="bottomSentinelDiv")

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(postBackgroundColor);
}
</style>
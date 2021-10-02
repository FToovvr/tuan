<script setup lang="ts">

import gsap from 'gsap'

import { useStuffStore } from '~/stores/stuff'
import { currentPageNumberKey, currentPostIdKey } from '~/logic/injectKeys'

import FixedWrapper from '~/components/misc/FixedWrapper.vue'

const route = useRoute()

interface Params {
    folder: string
    quest: string
    page: string
}
const params = route.params as unknown as Params
let { folder, quest, page } = $(reactive({ ...params }))

const stuffStore = useStuffStore()

onMounted(async () => {
    stuffStore.loadCurrentQuest(folder, quest)
})

let currentPageNumber = $ref(Number(page))
let currentPostId: number | null = $ref(null)
provide(currentPageNumberKey, $$(currentPageNumber))
provide(currentPostIdKey, $$(currentPostId))
throttledWatch([$$(currentPageNumber), $$(currentPostId)], () => {
    history.replaceState({}, '', String(currentPageNumber))
    history.replaceState({}, '', currentPostId ? `#id-${currentPostId}` : '')
}, { throttle: 300 })

// TODO
let startPageNumber = $ref(currentPageNumber)
let endPageNumber = $ref(currentPageNumber)

let postLength = $computed(() => stuffStore.currentQuest?.posts?.length)
let maxPageNumber = $computed(() => postLength ? ((((postLength ?? 1) - 1) / 19 | 0) + 1) : null)
// 模板解析有 bug，所以单独提取出来
let hasNextPage = $computed(() => endPageNumber < (maxPageNumber ?? 0))

function getPageElement(page: number): HTMLElement | null {
    return document.querySelector(`#page-${page}`)
}

function loadPreviousPage() {
    const oldStartPageOffsetY = getPageElement(startPageNumber)!.offsetTop
    startPageNumber--
    nextTick(async () => {
        // FIXME: 会导致位置闪一下，
        // 如果没猜错问题所在，正确做法应该是：
        // 内层的组件在把自动第一层引用视图固定完后再触发 @updated
        await new Promise((r) => setTimeout(r, 5))
        const oldStartPageOffsetYNow = getPageElement(startPageNumber + 1)!.offsetTop
        const deltaTop = oldStartPageOffsetYNow - oldStartPageOffsetY
        window.scrollBy({ top: deltaTop })
    })
}

interface ScrollOption {
    behavior?: 'smooth' | 'auto'
}
let pageToJumpTo: number | null = $ref(null)
let jumpToPageOptions: ScrollOption | null = $ref(null)
function jumpToPage() {
    if (!pageToJumpTo) { return }
    const finalOptions = { ...{ behavior: 'smooth' }, ...jumpToPageOptions }
    if (finalOptions!.behavior === 'auto') {
        getPageElement(pageToJumpTo)!.scrollIntoView()
    } else {
        stuffStore.isInAutoScrolling = true
        gsap.to(window, {
            scrollTo: getPageElement(pageToJumpTo)!.getBoundingClientRect().top + window.scrollY,
            onComplete: () => {
                stuffStore.isInAutoScrolling = false
            }
        })
    }
    if (pageToJumpTo) { pageToJumpTo = null }
}

function gotoPage(toPage: number, from?: 'control') {
    if (toPage >= startPageNumber && toPage <= endPageNumber) {
        // noop
    } else if (toPage === startPageNumber - 1) {
        startPageNumber = toPage
    } else if (toPage === endPageNumber + 1) {
        endPageNumber = toPage
    } else {
        startPageNumber = toPage
        endPageNumber = toPage
        // 否则跳页后滚动高度仍处于原先滚动高度
        window.scrollTo({ top: 0 })
    }
    currentPostId = null
    pageToJumpTo = toPage
}

let autoLoadNextPageSentinelDiv: HTMLElement | null = $ref(null)
onMounted(() => {
    useIntersectionObserver($$(autoLoadNextPageSentinelDiv), ([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
            endPageNumber++
        }
    }, { threshold: [0] })
})

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    fixed-wrapper.page-control(class="bottom-2 sm:bottom-6")
        page-number-control(
            v-model.number="currentPageNumber" :max="maxPageNumber"
            @update:model-value="gotoPage($event, 'control')"
        )

    | {{ folder }} &gt; {{ quest }}
    hr

    page-load-button(
        v-if="startPageNumber - 1 > 0"
        direction="up" :page-number="startPageNumber - 1"
        @click="loadPreviousPage"
    )

    div(w:h="2")

    quest-thread-page-viewer(
        :page-start="startPageNumber" :page-end="endPageNumber" :page-current="currentPageNumber"
        @ready="jumpToPage"
    )

    div(w:h="2")

    page-load-button(
        v-if="hasNextPage"
        direction="down" :page-number="endPageNumber + 1"
        @click="endPageNumber++"
    )

    div(
        ref="autoLoadNextPageSentinelDiv"
        w:m="b-8"
    )
</template>

<style scoped lang="scss">
.page-control {
    left: 50%;
    transform: translateX(-50%);
}
</style>
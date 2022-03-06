<!--
    串页面，即进入串后所处的页面。
-->
<script setup lang="ts">

import { useStuffStore } from '~/stores/stuff'
import { currentPageNumberKey, currentPostIdKey } from '~/logic/injectKeys'
import { scrollIntoViewSmoothly } from '~/logic/smooth-scroll';

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

// 加载的串页面的范围，不一定已经准备好了
// TODO: 回忆起这个 TODO 是要干什么来着的
let pageStart = $ref(currentPageNumber)
let pageEnd = $ref(currentPageNumber)

let postLength = $computed(() => stuffStore.currentQuest?.posts?.length)
let maxPageNumber = $computed(() => postLength ? ((((postLength ?? 1) - 1) / 19 | 0) + 1) : null)
// 模板解析有 bug，所以单独提取出来
let hasNextPage = $computed(() => pageEnd < (maxPageNumber ?? 0))

function getPageElement(page: number): HTMLElement | null {
    return document.querySelector(`#page-${page}`)
}

function loadPreviousPage() {
    const oldStartPageOffsetY = getPageElement(pageStart)!.offsetTop
    pageStart--
    nextTick(async () => {
        // FIXME: 会导致位置闪一下，
        // 如果没猜错问题所在，正确做法应该是：
        // 内层的组件在把自动第一层引用视图固定完后再触发 @updated
        await new Promise((r) => setTimeout(r, 5))
        const oldStartPageOffsetYNow = getPageElement(pageStart + 1)!.offsetTop
        const deltaTop = oldStartPageOffsetYNow - oldStartPageOffsetY
        window.scrollBy({ top: deltaTop })
    })
}

// 用于控制翻页控件是否允许上下翻页
// 实际是 readyPages 应该只有一个元素
let readyPages: { start: number, end: number }[] = reactive([])
function onThreadViewerUpdated(_readyPages: { start: number, end: number }[]) {
    readyPages = _readyPages
    jumpToPage()
}

interface ScrollOption {
    behavior?: 'smooth' | 'auto'
}
let pendingJumpingToPage: { pageToJumpTo: number, jumpToPageOptions: ScrollOption | null } | null = null
function jumpToPage(pageToJumpTo: number | null = null, jumpToPageOptions: ScrollOption | null = null) {
    if (pageToJumpTo === null) {
        if (!pendingJumpingToPage) {
            return
        }
        pageToJumpTo = pendingJumpingToPage.pageToJumpTo
        jumpToPageOptions = pendingJumpingToPage.jumpToPageOptions
    }

    // 如果准备好的串页面中没有要跳转的那页，则暂不执行
    if (readyPages.filter(({start, end}) => pageToJumpTo! >= start && pageToJumpTo! <= end).length === 0) {
        pendingJumpingToPage = { pageToJumpTo, jumpToPageOptions }
        return
    } else {
        pendingJumpingToPage = null
    }

    const finalOptions = { ...{ behavior: 'smooth' }, ...jumpToPageOptions }
    if (finalOptions!.behavior === 'auto') {
        getPageElement(pageToJumpTo)!.scrollIntoView()
    } else {
        // 由于要记录是否正在滚动，不能直接用 `.scrollIntoView({ behavior: "smooth" })`
        stuffStore.isInAutoScrolling = true
        scrollIntoViewSmoothly({
            finalY: getPageElement(pageToJumpTo)!.getBoundingClientRect().top + window.scrollY,
            durationMs: 300,
            onComplete: () => {
                stuffStore.isInAutoScrolling = false
            }
        })
    }
}

function gotoPage(toPage: number, from?: 'control') {
    if (toPage >= pageStart && toPage <= pageEnd) {
        // noop
    } else if (toPage === pageStart - 1) {
        pageStart = toPage
    } else if (toPage === pageEnd + 1) {
        pageEnd = toPage
    } else {
        pageStart = toPage
        pageEnd = toPage
        // 否则跳页后滚动高度仍处于原先滚动高度
        window.scrollTo({ top: 0 })
    }
    currentPostId = null

    jumpToPage(toPage)
}

// 划到网页最下方会碰到这个 div，接着触发自动加载下一页
let autoLoadNextPageSentinelDiv: HTMLElement | null = $ref(null)
onMounted(() => {
    useIntersectionObserver($$(autoLoadNextPageSentinelDiv), ([{ intersectionRatio }]) => {
        if (intersectionRatio > 0) {
            pageEnd++
        }
    }, { threshold: [0] })
})

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    //- 浮动的页数控件
    fixed-wrapper.page-control(class="bottom-2 sm:bottom-6")
        page-number-control(
            v-model.number="currentPageNumber" :max="maxPageNumber"
            @update:model-value="gotoPage($event, 'control')"
        )

    | {{ folder }} &gt; {{ quest }}
    hr

    //- 用于加载上一页的按钮
    page-load-button(
        v-if="pageStart - 1 > 0"
        direction="up" :page-number="pageStart - 1"
        @click="loadPreviousPage"
    )

    div(w:h="2")

    //- 整个已经加载的串内容
    quest-thread-page-viewer(
        :page-start="pageStart" :page-end="pageEnd" :page-current="currentPageNumber"
        @updated="onThreadViewerUpdated($event)"
    )

    div(w:h="2")

    //- 用于加载下一页的按钮
    //- 由于有自动加载，再加上会被页数控件挡住，目前看不到…
    page-load-button(
        v-if="hasNextPage"
        direction="down" :page-number="pageEnd + 1"
        @click="pageEnd++"
    )

    //- 用于触发自动加载下一页
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
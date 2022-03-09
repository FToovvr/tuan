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

const stopWatching = watch(toRef(stuffStore, 'isInitialized'), () => {
    if (stuffStore.isInitialized) {
        stopWatching()
        stuffStore.loadCurrentQuestLegacy(folder, quest)
    }
}, { immediate: true })
let currentQuestPrepared = $computed(() => stuffStore.currentQuest !== null)

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

let postLength = $computed(() => stuffStore.currentQuest?.postCount)
let maxPageNumber = $computed(() => postLength ? ((((postLength ?? 1) - 1) / 19 | 0) + 1) : null)
// 模板解析有 bug，所以单独提取出来
let hasNextPage = $computed(() => pageEnd < (maxPageNumber ?? 0))

function getPageElement(page: number): HTMLElement | null {
    return document.querySelector(`#page-${page}`)
}

// 如果非 null，下次 ThreadViewer 完成更新后需要更新滚动高度并将其归位为 null
let offsetYOfOldFirstPageBeforeLoadingNewPages: number | null = null
let scrollYAfterFirstPagesRemoved: number | null
function loadPreviousPage() {
    offsetYOfOldFirstPageBeforeLoadingNewPages = getPageElement(pageStart)!.offsetTop
    pageStart--
}

// 用于控制翻页控件是否允许上下翻页
let pageStatuses = $ref(new Map<number, "loading" | "ready">())
function onThreadViewerUpdated(_pageStatuses: Map<number, "loading" | "ready">) {
    pageStatuses = _pageStatuses

    // 处理位于最上方的串页面被去掉后的情况
    if (scrollYAfterFirstPagesRemoved) {
        window.scrollTo(window.scrollX, scrollYAfterFirstPagesRemoved)
        scrollYAfterFirstPagesRemoved = null
    }
    // 处理串页面被添加到最上方后的情况
    if (offsetYOfOldFirstPageBeforeLoadingNewPages !== null) {
        const offsetYOfOldFirstPageNow = getPageElement(pageStart + 1)!.offsetTop
        const deltaOffsetY = offsetYOfOldFirstPageNow - offsetYOfOldFirstPageBeforeLoadingNewPages
        window.scrollBy({ top: deltaOffsetY })
        offsetYOfOldFirstPageBeforeLoadingNewPages = null
    }

    // FIXME: safari 往上翻不滚动；以下改为 nextTick 会让 Chrome 也不滚动…
    requestAnimationFrame(() => jumpToPage())
}

let haltScrolling: (() => void) | null = null
interface ScrollOption {
    behavior?: 'smooth' | 'auto'
}
let pendingJumpingToPage: { pageToJumpTo: number, jumpToPageOptions: ScrollOption | null } | null = null
// FIXME: 需要加载上一页时会直接跳到那一页，不平滑滚动了
function jumpToPage(pageToJumpTo: number | null = null, jumpToPageOptions: ScrollOption | null = null) {
    if (pageToJumpTo === null) {
        if (!pendingJumpingToPage) {
            return
        }
        pageToJumpTo = pendingJumpingToPage.pageToJumpTo
        jumpToPageOptions = pendingJumpingToPage.jumpToPageOptions
    }

    // 如果准备好的串页面中没有要跳转的那页，则暂不执行
    if (pageStatuses.get(pageToJumpTo) !== "ready") {
        pendingJumpingToPage = { pageToJumpTo, jumpToPageOptions }
        return
    } else {
        pendingJumpingToPage = null
    }

    if (haltScrolling) {
        haltScrolling()
        haltScrolling = null
    }

    const finalOptions = { ...{ behavior: 'smooth' }, ...jumpToPageOptions }
    if (finalOptions!.behavior === 'auto') {
        getPageElement(pageToJumpTo)!.scrollIntoView()
    } else {
        // 由于要记录是否正在滚动，不能直接用 `.scrollIntoView({ behavior: "smooth" })`
        stuffStore.isInAutoScrolling = true
        haltScrolling = scrollIntoViewSmoothly({
            finalY: getPageElement(pageToJumpTo)!.getBoundingClientRect().top + window.scrollY,
            durationMs: 300,
            onComplete: () => {
                stuffStore.isInAutoScrolling = false
            }
        })
    }
}

let toPage: number | null = $ref(null)
let toPageThrottle = computed(() => {
    if (toPage === null) {
        return 0
    }
    if (pageStatuses.get(toPage) !== "ready") {
        return 500
    }
    return 0
})
throttledWatch($$(toPage), () => {
    if (toPage === null) {
        return
    }

    currentPageNumber = toPage
    if (toPage >= pageStart && toPage <= pageEnd) {
        // noop
    } else if (toPage === pageStart - 1) {
        pageStart = toPage
        if (pageEnd > pageStart + 9) {
            // 防止性能问题的 workaround
            pageEnd = pageStart + 9
        }
    } else if (toPage === pageEnd + 1) {
        pageEnd = toPage
        if (pageEnd > pageStart + 9) {
            // 防止性能问题的 workaround

            const oldFirstPageOffsetTop = getPageElement(pageStart)!.getBoundingClientRect().top
            const newFirstPageOffsetTop = getPageElement(pageEnd - 9)!.getBoundingClientRect().top
            scrollYAfterFirstPagesRemoved = window.scrollY - (newFirstPageOffsetTop - oldFirstPageOffsetTop)

            pageStart = pageEnd - 9
        }
    } else {
        pageStart = toPage
        pageEnd = toPage
        // 否则跳页后滚动高度仍处于原先滚动高度
        window.scrollTo({ top: 0 })
    }
    currentPostId = null

    jumpToPage(toPage)

    toPage = null
}, { throttle: toPageThrottle })

function changePage(_toPage: number, from?: 'control') {
    toPage = _toPage
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
div(v-if="currentQuestPrepared" class="max-w-2xl mx-auto")
    //- 浮动的页数控件
    fixed-wrapper.page-control(class="bottom-2 sm:bottom-6")
        page-number-control(
            :current-page.number="toPage || currentPageNumber" :max="maxPageNumber"
            :page-statuses="pageStatuses"
            @page-change-required="changePage($event, 'control')"
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
<script setup lang="ts">

interface Props {
    pageStart: number
    pageEnd: number
    pageCurrent: number
}
const props = defineProps<Props>()

const emit = defineEmits(['updated'])

let pageNumbers = $computed(() => function* () {
    for (let i = props.pageStart; i <= props.pageEnd; i++) {
        yield i
    }
})

// 已完成渲染的页面，按顺序从小到大，相邻的合并
const readyPages: { start: number, end: number }[] = reactive([])
// 在要求加载的页面范围更新后，清除范围外页面 “完成渲染” 的标记
watch([toRef(props, 'pageStart'), toRef(props, 'pageEnd')], () => {
    for (let i = 0; i < readyPages.length;) {
        const { start, end } = readyPages[i]
        if (end < props.pageStart || start > props.pageEnd) {
            readyPages.splice(i, 1)
            continue
        }
        if (start < props.pageStart) {
            readyPages[i].start = props.pageStart
        }
        if (end > props.pageEnd) {
            readyPages[i].end = props.pageEnd
        }
        i++
    }
})
watch(readyPages, () => {
    nextTick(() => emit('updated', readyPages))
})
function addReadyPages(pageNumber: number) {
    for (let i = 0; i < readyPages.length; i++) {
        const { start, end } = readyPages[i]
        if (pageNumber < start - 1) {
            readyPages.splice(i, 0, { start: pageNumber, end: pageNumber })
            return
        } else if (pageNumber === start - 1) {
            readyPages[i].start = start - 1
            return
        } else if (pageNumber >= start && pageNumber <= end) {
            return
        } else if (pageNumber === end + 1) {
            readyPages[i].end = end + 1
            return
        }
        // pageNumber > end: continue
    }
    // pageNumber 最大
    readyPages.push({ start: pageNumber, end: pageNumber })
}

</script>

<template lang="pug">

div(v-for="page, i in pageNumbers()" :key="page")
    div(v-if="Number(i) !== 0" w:h="2")
    quest-thread-page-content(
        :props="{ type: 'page', page: page }"
        :style="{ zIndex: -page }"
        @ready="addReadyPages(page)"
    )

</template>
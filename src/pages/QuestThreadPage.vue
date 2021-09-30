<script setup lang="ts">

import { useStuffStore } from '~/stores/stuff'
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
watch($$(currentPageNumber), () => {
    history.replaceState({}, '', String(currentPageNumber))
    nextTick(() => document.querySelector('main')?.scrollIntoView())
})

// TODO
let startPageNumber = $computed(() => currentPageNumber)
let endPageNumber = $computed(() => currentPageNumber)

let postLength = $computed(() => stuffStore.currentQuest?.posts?.length)
let maxPageNumber = $computed(() => postLength ? ((((postLength ?? 1) - 1) / 19 | 0) + 1) : null)
// 模板解析有 bug，所以单独提取出来
let hasNextPage = $computed(() => endPageNumber < (maxPageNumber ?? 0))

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    fixed-wrapper.page-control(class="bottom-2 sm:bottom-6")
        page-number-control(v-model.number="currentPageNumber" :max="maxPageNumber")

    | {{ folder }} &gt; {{ quest }}
    hr

    page-load-button(
        v-if="startPageNumber - 1 > 0"
        direction="up" :page-number="startPageNumber - 1"
    )

    quest-thread-page-viewer(:page-start="startPageNumber" :page-end="endPageNumber" :page-current="currentPageNumber")

    page-load-button(
        v-if="hasNextPage"
        direction="down" :page-number="endPageNumber + 1"
    )

    div(w:m="b-8")
</template>

<style scoped lang="scss">
.page-control {
    left: 50%;
    transform: translateX(-50%);
}
</style>
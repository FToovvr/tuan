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
let { folder, quest, page } = $(toRefs(params))

const stuffStore = useStuffStore()

onMounted(async () => {
    stuffStore.loadCurrentQuest(folder, quest)
})

let currentPageNumber = $ref(Number(page))
watch($$(currentPageNumber), () => {
    history.replaceState({}, '', String(currentPageNumber))
    nextTick(() => document.querySelector('main')?.scrollIntoView())

})

let maxPageNumber = $computed(() => ((stuffStore.currentQuest?.posts?.length ?? 1 - 1) / 19 | 0) + 1)

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    | {{ folder }} > {{ quest }}
    hr
    fixed-wrapper.page-control(class="bottom-2 sm:bottom-6")
        quest-thread-page-control(v-model.number="currentPageNumber" :max="maxPageNumber")
    hr
    quest-thread-page-viewer(:page-start="currentPageNumber" :page-end="currentPageNumber" :page-current="currentPageNumber")
    div(w:m="b-8")
</template>

<style scoped lang="scss">
.page-control {
    left: 50%;
    transform: translateX(-50%);
}
</style>
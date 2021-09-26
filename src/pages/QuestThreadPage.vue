<script setup lang="ts">

import { useStuffStore } from '~/stores/stuff'

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
})

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    | {{ folder }} > {{ quest }}
    hr
    div.flex(class="m-auto w-max space-x-2")
        button(@click="currentPageNumber--") &lt;
        page-number-input(
            v-model.number="currentPageNumber"
            :max="((stuffStore.currentQuest?.posts?.length ?? 1 - 1) / 19 | 0) + 1"
        )
        button(@click="currentPageNumber++") &gt;
    hr
    quest-thread-page-viewer(:page-start="currentPageNumber" :page-end="currentPageNumber" :page-current="currentPageNumber")
    div(w:m="b-8")
</template>

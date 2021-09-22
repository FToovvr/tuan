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
let offsetStart = $computed(() => (currentPageNumber - 1) * 19)

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
    | {{ folder }} {{ quest }} {{ page }}
    hr
    div
        | 页数:
        |
        input(
            type="number" min="1" step="1"
            w:border="2"
            v-model.number="currentPageNumber"
        )
        | 
        button(@click="currentPageNumber--") --
        | 
        button(@click="currentPageNumber++") ++
    hr
    quest-thread-page-content(:floor-start="offsetStart + 1" :floor-count="19")
</template>

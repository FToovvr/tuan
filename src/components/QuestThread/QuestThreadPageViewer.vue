<script setup lang="ts">

interface Props {
    pageStart: number
    pageEnd: number
    pageCurrent: number
}
const props = defineProps<Props>()

let pageNumbers = $computed(() => function* () {
    // 不要 reactive 
    const { pageStart, pageEnd } = props
    for (let i = pageStart; i <= pageEnd; i++) {
        yield i
    }
})

</script>

<template lang="pug">

div(
    v-for="page, i in pageNumbers()" :key="page"
    class="space-y-2"
)
    div(v-if="Number(i) !== 0" w:h="2")
    quest-thread-page-content(
        :props="{ type: 'page', page: page }"
        :style="{ zIndex: -page }"
    )

</template>
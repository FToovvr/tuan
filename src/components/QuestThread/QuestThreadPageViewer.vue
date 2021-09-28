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

div(v-for="page in pageNumbers()" :key="page")
    div(w:h="2")
    quest-thread-page-content(
        :props="{ type: 'page', page: page }"
        :style="{ zIndex: -page }"
    )

</template>
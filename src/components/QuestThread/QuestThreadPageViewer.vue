<script setup lang="ts">

interface Props {
    pageStart: number
    pageEnd: number
    pageCurrent: number
}
const props = defineProps<Props>()

const emit = defineEmits(['ready'])

onMounted(() => nextTick(() => emit('ready')))
onUpdated(() => nextTick(() => emit('ready')))

let pageNumbers = $computed(() => function* () {
    for (let i = props.pageStart; i <= props.pageEnd; i++) {
        yield i
    }
})

</script>

<template lang="pug">

div(v-for="page, i in pageNumbers()" :key="page")
    div(v-if="Number(i) !== 0" w:h="2")
    quest-thread-page-content(
        :props="{ type: 'page', page: page }"
        :style="{ zIndex: -page }"
    )

</template>
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

const pageStatuses = new Map<number, "loading" | "ready">()
watch([toRef(props, 'pageStart'), toRef(props, 'pageEnd')], () => {
    for (const page of [...pageStatuses.keys()]) {
        if (page < props.pageStart || page > props.pageEnd) {
            pageStatuses.delete(page)
        }
    }
    for (let page = props.pageStart; page <= props.pageEnd; page++) {
        if (!pageStatuses.has(page)) {
            pageStatuses.set(page, "loading")
        }
    }
}, { immediate: true })
function addReadyPages(pageNumber: number) {
    pageStatuses.set(pageNumber, "ready")
    emit("updated", pageStatuses)
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
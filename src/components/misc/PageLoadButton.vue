<script setup lang="ts">

interface Props {
    direction: 'up' | 'down'
    pageNumber: number
}

defineProps<Props>()
</script>

<template lang="pug">
.flex(
    class="items-center justify-center space-x-1 cursor-pointer" w:text="gray-700 dark:gray-300 opacity-80"
)
    ph-caret-double-up-bold(v-if="direction === 'up'" style="font-size: 0.875rem;")
    ph-caret-double-down-bold(v-if="direction === 'down'" style="font-size: 0.875rem;")
    div(w:font="bold" w:text="sm") 加载{{ pageNumber }}页…

</template>
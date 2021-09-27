<script setup lang="ts">
import zIndexes from "~/logic/zIndexes";

const zIndex = zIndexes.fixedWrapper
</script>

<template lang="pug">
.fixed(
    class="px-1 py-1.5 rounded-3xl" w:border="1 gray-500"
    w:bg="white dark:gray-900"
)
    slot
</template>

<style scoped lang="scss">
div {
    z-index: v-bind(zIndex);
}
</style>
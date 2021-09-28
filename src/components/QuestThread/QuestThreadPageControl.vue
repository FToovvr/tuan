<script setup lang="ts">

interface Props {
    modelValue: number
    max: number | null
}
const props = defineProps<Props>()

const emit = defineEmits(['update:modelValue'])

function changePage(newValue: number) {
    if (newValue > 0 && newValue <= (props.max ?? 0)) {
        emit('update:modelValue', newValue)
    }
}

</script>

<template lang="pug">
div.flex(w:m="auto" w:w="max" w:space="x-1" w:p="0.5" w:items="center")
    button(
        @click="changePage(modelValue - 1)"
        :disabled="modelValue === 1"
        w:h="1.2em" w:text="2xl"
    )
        ion-caret-up
    page-number-input(
        :modelValue="modelValue"
        :max="max"
        @update:model-value="changePage($event)"
    )
    button(
        @click="changePage(modelValue + 1)"
        :disabled="modelValue === max"
        w:h="1.2em" w:text="2xl"
    )
        ion-caret-down
</template>

<style scoped lang="scss">
button[disabled] {
    @apply text-gray-300 dark:text-gray-700;
}
</style>
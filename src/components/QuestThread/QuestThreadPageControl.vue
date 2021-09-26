<script setup lang="ts">

interface Props {
    modelValue: number
    max: number
}
const props = defineProps<Props>()

const emit = defineEmits(['update:modelValue'])

function changePage(newValue: number) {
    if (newValue > 0 && newValue <= props.max) {
        emit('update:modelValue', newValue)
    }
}

</script>

<template lang="pug">
div.flex(w:m="auto" w:w="max" w:space="x-0" w:items="center")
    button(
        @click="changePage(modelValue - 1)"
        w:h="1.2em" w:text="3xl"
    )
        carbon-caret-left
    page-number-input(
        :modelValue="modelValue"
        :max="max"
        @update:model-value="changePage($event)"
    )
    button(
        @click="changePage(modelValue + 1)"
        w:h="1.2em" w:text="3xl"
    )
        carbon-caret-right
</template>
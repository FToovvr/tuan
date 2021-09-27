<script setup lang="ts">

interface Props {
    max: number
    modelValue: number
}
const props = defineProps<Props>()
let currentValue = $(toRef(props, 'modelValue'))

const emit = defineEmits(['update:modelValue'])

let width = $computed(() => `${props.max.toString().length + 1}ch`)


function changePage(newValue: string | number) {
    let numValueNum = Number(newValue)
    if (!Number.isInteger(numValueNum)
        || (numValueNum <= 0 || numValueNum > props.max)) {
        if (newValue === '') { // 方便完全删除
            return true
        }
        return false
    }

    emit('update:modelValue', newValue)
    return true
}

let inputRef: HTMLInputElement | null = $ref(null)

onMounted(() => {
    inputRef!.oninput = function (ev) {
        // @ts-ignore this.value
        if (!changePage(this.value)) {
            // @ts-ignore this.value
            this.value = currentValue
        }
    }
})

function focusOnInput(ev: Event) {
    if (!(ev.target instanceof HTMLInputElement)) {
        inputRef?.focus()
    }
}

</script>

<template lang="pug">
div.flex(
    w:justify="center"
    @click="focusOnInput"
)
    input.block(
        ref="inputRef"
        type="number" inputmode="decimal"
        :value="currentValue"
    )
    div /
    div.max {{ max }}
</template>

<style scoped lang="scss">
div.flex {
    @apply rounded-lg border-2 border-gray-400 bg-white;
    @apply font-mono text-black;
    margin: auto;
    width: calc(v-bind(width) * 2 + 2ch);
}

input {
    width: v-bind(width);
    margin: 0;
    padding: 0;

    @apply h-6 bg-transparent;
    @apply text-center text-black;

    // https://stackoverflow.com/a/22559163
    &[type="number"] {
        -moz-appearance: textfield;
    }
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
}

.max {
    width: v-bind(width);
}
</style>
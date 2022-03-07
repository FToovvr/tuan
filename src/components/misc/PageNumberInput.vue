<script setup lang="ts">

interface Props {
    modelValue: number
    max: number | null
    disabled?: boolean
}
const props = defineProps<Props>()
let currentValue = $(toRef(props, 'modelValue'))

const emit = defineEmits(['update:modelValue'])

let width = $computed(() => `${Math.max(props.max ?? 0, props.modelValue).toString().length + 1}ch`)

function changePage(newValue: string | number, recoverCaret = false) {
    if (props.disabled) {
        return
    }
    const caretStart = recoverCaret ? inputRef?.selectionStart : null

    let numValueNum = Number(newValue)
    if (!Number.isInteger(numValueNum)
        || (numValueNum <= 0 || numValueNum > (props.max ?? 0))) {
        if (newValue === '') { // 方便完全删除
            return true
        }
        return false
    }

    emit('update:modelValue', Number(newValue))

    if (caretStart) {
        nextTick(() => inputRef?.setSelectionRange(caretStart!, caretStart!))
    }

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
        inputmode="decimal"
        :value="currentValue"
        @keydown.up.prevent="changePage(currentValue - 1, true)" @keydown.down.prevent="changePage(currentValue + 1, true)"
    )
    div /
    div.max {{ max ?? '…' }}
</template>

<style scoped lang="scss">
div.flex {
    @apply rounded-lg border-2 border-gray-400 bg-white;
    @apply font-mono text-black;
    margin: auto;
    width: calc(v-bind(width) * 2 + 2ch);

    user-select: none;
    cursor: text;
}

input {
    width: v-bind(width);
    margin: 0;
    padding: 0;

    @apply h-6 bg-transparent;
    @apply text-center text-black;
}

.max {
    width: v-bind(width);
}
</style>
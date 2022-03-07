<!--
    页数控件
    显示当前页数和最大页数；
    可以调节页数（直接输入或按上下按钮）。
    TODO: 也许点击页数输入框时，可以给个方便地页数选择控件
-->
<script setup lang="ts">

interface Props {
    // 当前所在页面
    currentPage: number
    // 最大页数
    max: number | null

    // 尚在加载的页面
    // 若按钮将跳转的页面位于其中，则该按钮图标将变为 “加载中”，并被禁用
    pageStatuses: Map<number, "loading" | "ready">
}
const props = defineProps<Props>()

const emit = defineEmits([
    // 要求改变页数时发送
    'pageChangeRequired',
])

function requirePageChange(newValue: number) {
    if (newValue > 0 && newValue <= (props.max ?? 0)) {
        emit('pageChangeRequired', newValue)
    }
}

let isPreviousPageLoading = $computed(() => {
    return props.pageStatuses.get(props.currentPage - 1) === "loading"
})
let isNextPageLoading = $computed(() => {
    return props.pageStatuses.get(props.currentPage + 1) === "loading"
})

</script>

<template lang="pug">
div.flex(w:m="auto" w:w="max" w:space="x-1" w:p="0.5" w:items="center")
    //- TODO: 加载时的 “加载中图标”
    button(
        @click="requirePageChange(currentPage - 1)"
        :disabled="currentPage === 1 || isPreviousPageLoading"
        w:h="1.2em" w:text="2xl"
    )
        ion-caret-up
    page-number-input(
        :modelValue="currentPage"
        :max="max"
        @update:model-value="requirePageChange($event)"
    )
    //- TODO: 加载时的 “加载中图标”
    button(
        @click="requirePageChange(currentPage + 1)"
        :disabled="currentPage === max || isNextPageLoading"
        w:h="1.2em" w:text="2xl"
    )
        ion-caret-down
</template>

<style scoped lang="scss">
button[disabled] {
    @apply text-gray-300 dark:text-gray-700;
}
</style>
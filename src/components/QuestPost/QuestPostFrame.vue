<script setup lang="ts">
interface Props {
    isRefPost: boolean
    isCollapsed: boolean
    backgroundColorRgbHex: string
}
const props = defineProps<Props>()

const emit = defineEmits(['expand'])

function onClick(ev: Event) {
    if (props.isCollapsed) {
        emit('expand')
        ev.stopPropagation()
    }
}
</script>

<template lang="pug">
article.quest-post.container.relative(
    w:border="1 dark:gray"
    :class="(isRefPost ? '!border-gray-400 pb-2 px-3' : 'pt-2 pb-3 px-6') + ' ' + (isCollapsed ? 'max-h-24 overflow-hidden' : '')"
    class="rounded-md"
)

    .quest-post-wrapper

        overflow-mask(
            v-if="isCollapsed"
            @click.capture="onClick"
            :background-color-rgb-hex="backgroundColorRgbHex"
        )

        //- 头部
        div(w:text="sm" class="sticky top-0" style="z-index: 1;")
            .quest-post-head(w:p="t-1")
                slot(name="head")
                div(w:clear="both")
                div(class="h-1")
                hr(w:m="x-0.5" w:border="dashed gray-400")

        div(:class="isRefPost ? 'h-1' : 'h-3'")

        //- 正文（+附图）
        .relative(@click.capture="onClick")
            slot(name="content")

        div(w:clear="both")

</template>

<style scoped lang="scss">
.quest-post,
.quest-post-head {
    background-color: v-bind(backgroundColorRgbHex);
}
</style>
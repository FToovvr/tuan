<script setup lang="ts">

import { useStuffStore } from "~/stores/stuff";

interface PropOffset {
    type: 'offset'
    offset: number
    count: number
}

interface PropPage {
    type: 'page'
    page: number
    pageSize?: number
}

interface Props {
    props: PropOffset | PropPage
}
const _outerProps = defineProps<Props>()

let computedProps = $computed(() => {
    const _props = toRef(_outerProps, 'props')
    let props = $(_props)
    if (props.type === 'offset') {
        return {
            ...props,
            description: `${props.offset + 1}楼 ~ ${props.offset + props.count}楼`,
        }
    } else {
        return {
            offset: (props.page - 1) * (props.pageSize ?? 19),
            count: props.pageSize ?? 19,
            description: `${props.page}页`,
        }
    }
})

const stuffStore = useStuffStore()

let posts = computed(() => {
    if (!stuffStore.currentQuest || !stuffStore.currentQuest.posts) {
        return []
    }
    return stuffStore.currentQuest.posts
        .slice(computedProps.offset, computedProps.offset + computedProps.count)
})

let postListRef = $ref(null)
onMounted(() => {
    useResizeObserver($$(postListRef), (entries) => {
        stuffStore.rootPostWidth = entries[0].contentRect.width
    })
})

</script>

<template lang="pug">
.post-page

    .post-page-bar
        .flex
            .dash
            div(w:p="x-2")
                span(w:font="mono") {{ computedProps.description }}
            .dash

    div(w:h="2")

    .post-list(
        ref="postListRef"
        w:space="y-1"
    )
        template(v-for="post in posts" :key="post.postId")
            quest-post(:post="post")
</template>

<style scoped lang="scss">
.post-page-bar .dash {
    @apply flex-1 h-0 m-auto border-1 border-dashed border-black dark:border-white;
}
</style>
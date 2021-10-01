<script setup lang="ts">

import QuestPostLoader from "../QuestPost/QuestPostLoader.vue";

import { useStuffStore } from "~/stores/stuff";
import zIndexes from "~/logic/zIndexes"

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
.post-page(:id="_outerProps.props.type === 'page' ? `page-${_outerProps.props.page}` : undefined")

    .post-page-bar
        bar-with-text
            span(w:font="mono") {{ computedProps.description }}

    div(w:h="2")

    .post-list(
        ref="postListRef"
        w:space="y-1"
    )
        template(v-for="post, i in posts" :key="post.postId")
            quest-post-loader(
                :post="post"
                :style="{ zIndex: zIndexes.post + posts.length - i }"
            )
</template>
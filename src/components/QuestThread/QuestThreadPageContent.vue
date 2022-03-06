<script setup lang="ts">

import QuestPostLoader from "../QuestPost/QuestPostLoader.vue";

import { useStuffStore } from "~/stores/stuff";
import zIndexes from "~/logic/zIndexes"
import { pageNumberKey } from "~/logic/injectKeys";

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

const emit = defineEmits(['ready'])

let pageNumber = $computed(() => _outerProps.props.type === 'page' ? _outerProps.props.page : null)
provide(pageNumberKey, $$(pageNumber))

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

let mountedFirstTime =true
// 在内容渲染后发出 “页面准备完成” 的事件，以便其他组件处理有关翻页的事宜
// QuestThreadPageViewer 每次变更页面范围都会触发一次，但实际只需通知一次
// XXX: onMounted 不会在 SSR 调用，不过暂时也不需要考虑这些，
//      再说，SSR 时也不需要考虑翻页的事
// FIXME: 应该等自动展开的引用视图展开后再发出
onMounted(() => {
    if (mountedFirstTime) {
        emit('ready')
        mountedFirstTime = false
    }
})

</script>

<template lang="pug">
.post-page(:id="pageNumber !== null ? `page-${pageNumber}` : undefined")

    //- 页的分割线，显示类似 “XX页” 或者 “XX楼 ~ XX楼” 这样的信息
    .post-page-bar
        bar-with-text
            span(w:font="mono") {{ computedProps.description }}

    div(w:h="2")

    //- 页中的各条帖子
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
<script setup lang="ts">

import QuestPostLoader from "../QuestPost/QuestPostLoader.vue";

import { useStuffStore } from "~/stores/stuff";
import zIndexes from "~/logic/zIndexes"
import { pageNumberKey } from "~/logic/injectKeys";
import { rawPostToPost } from "~/logic/post";
import type { Post } from "~/logic/post";

interface PropPage {
    type: 'page'
    page: number
    pageSize?: number
}

interface Props {
    props: PropPage
}
const _outerProps = defineProps<Props>()

const emit = defineEmits(['ready'])

let pageNumber = $computed(() => _outerProps.props.type === 'page' ? _outerProps.props.page : null)
provide(pageNumberKey, $$(pageNumber))

let description = $computed(() => _outerProps.props.type === 'page' ? `${_outerProps.props.page}页` : "?")

const stuffStore = useStuffStore()

// TODO: 未加载完成时应为 null，对应显示 “加载中” 提示
// TODO: 当一页未加载完成时，应该禁用自动加载下一页的功能
let posts: Post[] = $ref([])
watch(toRef(_outerProps, 'props'), async () => {
    const currentQuest = stuffStore.currentQuest!
    
    const rawPosts = await currentQuest.getPage(_outerProps.props.page)
    posts = rawPosts.map(rawPost =>
        rawPostToPost(
            rawPost,
            currentQuest,
            currentQuest.postFloorLookup.get(rawPost.id)!,
        )
    )
}, { immediate: true })

let postListRef = $ref(null)
onMounted(() => {
    useResizeObserver($$(postListRef), (entries) => {
        stuffStore.rootPostWidth = entries[0].contentRect.width
    })
})

// 在内容渲染后发出 “页面准备完成” 的事件，以便其他组件处理有关翻页的事宜
// QuestThreadPageViewer 每次变更页面范围都会触发一次，但实际只需通知一次
// FIXME: 应该等自动展开的引用视图展开后再发出
watch($$(posts), () => {
    if (posts) {
        nextTick(() => emit('ready'))
    }
})

</script>

<template lang="pug">
.post-page(:id="pageNumber !== null ? `page-${pageNumber}` : undefined")

    //- 页的分割线，显示类似 “XX页” 或者 “XX楼 ~ XX楼” 这样的信息
    .post-page-bar
        bar-with-text
            span(w:font="mono") {{ description }}

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
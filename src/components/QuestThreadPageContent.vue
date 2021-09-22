<script setup lang="ts">
// import type { Post } from '~/types/post'

import { useStuffStore } from "~/stores/stuff";
import { rawPostToPost } from "~/types/post";

// type Props = Post
// const props = defineProps<Props>()
interface Props {
    floorStart: number
    floorCount: number
}
const props = defineProps<Props>()

let { floorStart, floorCount } = $(toRefs(props))

const stuffStore = useStuffStore()

let posts = $computed(() => {
    if (!stuffStore.currentQuest || !stuffStore.currentQuest.posts) {
        return []
    }
    return stuffStore.currentQuest.posts
        .slice(floorStart - 1, floorStart - 1 + floorCount)
        .map((post, i) => rawPostToPost(post, stuffStore.currentQuest!, floorStart + i))
})

</script>

<template lang="pug">
div
    template(v-for="post in posts" :key="post.postId")
        quest-post(v-bind="post")
</template>
<script setup lang="ts">
// import type { Post } from '~/types/post'

// type Props = Post
// const props = defineProps<Props>()
interface Post {
    postId: number
    floorNumber: number
    createdAtUtc: number
    userId: string
    isPostOwner: boolean
    content: string

    imageUrl?: string
}
interface Props {
    posts: Post[]
}
defineProps<Props>()

</script>

<template lang="pug">
div
    template(v-for="post in posts" :key="post.postId")
        quest-post(v-bind="post")
</template>
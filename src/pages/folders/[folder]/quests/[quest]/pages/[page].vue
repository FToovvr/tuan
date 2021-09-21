<script setup lang="ts">
import type { Post } from '~/types/post'

interface Props {
  folder: string
  quest: string
  page: number
}
const props = defineProps<Props>()

let { folder, quest } = $(props)

let data = $ref(null)

onMounted(async () => {
  data = await (await fetch(`/assets/data/${folder}/${quest}/data.json`)).json()
})

let currentPageNumber = $ref(1)
let offsetStart = $computed(() => (currentPageNumber - 1) * 19)
let postsOfPage = $computed(() => {
  if (!data) {
    return []
  }
  const posts: Post[] = []
  for (let i = offsetStart; i < offsetStart + 19; i++) {
    const postData = data[i]
    if (!postData) {
      break
    }
    posts.push({
      postId: postData.id,
      floorNumber: i + 1,
      createdAtUtc: postData.created_at,
      userId: postData.user_id,
      isPostOwner: postData.user_id === 'bb82mcm',
      content: postData.content,
      imageUrl: !postData.attachment_base ? undefined : (() => {
        const fullImageName = `${postData.attachment_base}${postData.attachment_extension}`
        const imageName = fullImageName.split('/')[1]
        return `/assets/data/${folder}/${quest}/attachments/${imageName}`
      })(),
    })
  }
  return posts
})

</script>

<template lang="pug">
div(class="max-w-2xl mx-auto")
  | {{ folder }} {{ quest }} {{ page }}
  hr
  div
    | 页数:
    |
    input(
      w:border="2"
      v-model.number="currentPageNumber"
    )
    | 
    button(@click="currentPageNumber++") inc
    | 
    button(@click="currentPageNumber--") dec
  hr
  div(v-for="post in postsOfPage")
    quest-post(v-bind="post")
</template>

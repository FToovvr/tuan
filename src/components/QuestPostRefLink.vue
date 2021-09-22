<script setup lang="ts">

interface Props {
    postId: number
}
const props = defineProps<Props>()
let postId = $(toRef(props, 'postId'))

function onClick() {
    console.log(postId)
}

</script>

<template lang="pug">
span(
    style="color: #789922; cursor: zoom-in"
    w:font="mono" w:text="sm"
    @click="onClick"
) >>No.{{ postId }}
</template>
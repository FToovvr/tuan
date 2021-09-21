<script setup lang="ts">

interface Props {
    imageUrl: string
}
const props = defineProps<Props>()
props // 省得报错「未使用」
</script>

<template lang="pug">
figure(class="w-24")
    img(:src="imageUrl" loading="lazy")
</template>
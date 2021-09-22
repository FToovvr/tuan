<script setup lang="ts">

interface Props {
    imageUrl: string
}
const props = defineProps<Props>()
props // 省得报错「未使用」
</script>

<template lang="pug">
//- TODO: 长度大量超过正文时，应该隐藏超出的部分（渐隐效果）
//- 例：55 页第二张图
figure(class="w-24")
    img(:src="imageUrl" loading="lazy")
</template>
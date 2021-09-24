<script setup lang="ts">

import { remToPx } from "~/logic/units"

interface Props {
    imageUrl: string
}
const props = defineProps<Props>()
props // 省得报错「未使用」

let figureRef: HTMLElement | null = $ref(null)

let mode: "thumbnail" | "expanded" = $ref("thumbnail")

function onClick() {
    mode = (mode === "thumbnail" ? "expanded" : "thumbnail")
    if (mode === 'thumbnail') {
        console.log(figureRef!.getBoundingClientRect())
        if (figureRef!.getBoundingClientRect().top < 0) {
            figureRef!.closest(".quest-post")!.scrollIntoView()
            window.scrollBy(0, remToPx(-2))
        }
    }
}

</script>

<template lang="pug">
//- TODO: 长度大量超过正文时，应该隐藏超出的部分（渐隐效果）
//- 例：55 页第二张图
figure(
    ref="figureRef"
    :data-mode="mode"
    @click="onClick"
)
    img(:src="imageUrl" loading="lazy")
</template>

<style scoped lang="scss">
figure {
    &[data-mode="thumbnail"] {
        cursor: zoom-in;
        float: right;
        width: min(100%, max(6rem, calc(100% / 3)));
    }
    &[data-mode="expanded"] {
        cursor: zoom-out;
        margin: auto;
        width: 80%;
        padding-top: 0.5rem;
        padding-bottom: 1.5rem;
    }
}
</style>
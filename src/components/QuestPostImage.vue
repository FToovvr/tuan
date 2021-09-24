<script setup lang="ts">

import { remToPx } from "~/logic/units"

interface Props {
    imageUrl: string

    backgroundColorRgbHex: string
}
const props = defineProps<Props>()
props // 省得报错「未使用」

let figureRef: HTMLElement | null = $ref(null)

let mode: "thumbnail" | "expanded" = $ref("thumbnail")

function onClick() {
    mode = (mode === "thumbnail" ? "expanded" : "thumbnail")
    if (mode === 'thumbnail') {
        if (figureRef!.getBoundingClientRect().top < 0) {
            figureRef!.closest(".quest-post")!.scrollIntoView()
            window.scrollBy(0, remToPx(-2))
        }
    }
}

let currentImageSize = $ref({ width: 0, height: 0 })
onMounted(() => {
    useResizeObserver(figureRef!.querySelector('img'), (entries) => {
        currentImageSize = entries[0].contentRect
    })
})

let imageMaxHeight = $computed(() => currentImageSize.width * 2)
let imageMaxHeightCssValue = $computed(() => `${imageMaxHeight}px`)

</script>

<template lang="pug">
figure.relative(
    ref="figureRef"
    :data-mode="mode"
    @click="onClick"
)
    overflow-mask(
        v-if="mode === 'thumbnail' && currentImageSize.height > imageMaxHeight"
        :background-color-rgb-hex="backgroundColorRgbHex"
    )
    img(:src="imageUrl" loading="lazy")
</template>

<style scoped lang="scss">
figure {
    &[data-mode="thumbnail"] {
        cursor: zoom-in;
        float: right;
        width: min(100%, max(6rem, calc(100% / 3)));
        max-height: v-bind(imageMaxHeightCssValue);
        overflow: hidden;
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
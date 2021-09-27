<script setup lang="ts">

import zIndexes from '~/logic/zIndexes'

interface Props {
    backgroundColorRgbHex: string
    height?: string
}

const props = defineProps<Props>()

let height = $computed(() => props.height ?? '2rem')

let bg = $(toRef(props, 'backgroundColorRgbHex'))
let bgTransparent = $computed(() => `${bg}00`)

const overflowMaskZIndex = zIndexes.overflowMask

</script>

<template lang="pug">
div
</template>

<style scoped lang="scss">
// https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/src/style/style.scss
div::before {
    content: "";
    position: absolute;
    top: calc(100% - v-bind(height));
    left: 0;
    height: v-bind(height);
    width: 100%;
    background: linear-gradient(v-bind(bgTransparent), v-bind(bg));
    z-index: v-bind(overflowMaskZIndex);
}
</style>
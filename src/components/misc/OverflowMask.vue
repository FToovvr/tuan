<script setup lang="ts">

import zIndexes from '~/logic/zIndexes'

interface Props {
    direction?: 'top-bottom' | 'bottom-top'

    backgroundColorRgbHex: string
    height?: string

    zIndex?: number | boolean
}

const props = withDefaults(defineProps<Props>(), {
    direction: 'top-bottom',
    height: '2rem',
})

let top = $computed(() => props.direction === 'top-bottom' ? `calc(100% - ${props.height})` : 0)

let bg = $(toRef(props, 'backgroundColorRgbHex'))
let bgTransparent = $computed(() => `${bg}00`)
let background = $computed(() => props.direction === 'top-bottom' ? `linear-gradient(${bgTransparent}, ${bg})` : `linear-gradient(${bg}, ${bgTransparent})`)

const overflowMaskZIndex = (typeof props.zIndex === 'number') ? props.zIndex : (props.zIndex ? zIndexes.overflowMask : null)

</script>

<template lang="pug">
div
</template>

<style scoped lang="scss">
// https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/src/style/style.scss
div::before {
    content: "";
    position: absolute;
    top: v-bind(top);
    left: 0;
    height: v-bind(height);
    width: 100%;
    background: v-bind(background);
    z-index: v-bind(overflowMaskZIndex);
}
</style>
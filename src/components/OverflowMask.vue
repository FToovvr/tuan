<script setup lang="ts">

interface Props {
    backgroundColorRgbHex: string
}

const props = defineProps<Props>()

let bg = $(toRef(props, 'backgroundColorRgbHex'))
let bgTransparent = $computed(() => `${bg}00`)

</script>

<template lang="pug">
div
</template>

<style scoped lang="scss">
// https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/src/style/style.scss
div::before {
    --mask-height: 2rem;
    content: "";
    position: absolute;
    top: calc(100% - var(--mask-height));
    left: 0;
    height: var(--mask-height);
    width: 100%;
    background: linear-gradient(v-bind(bgTransparent), v-bind(bg));
    z-index: 3;
}
</style>
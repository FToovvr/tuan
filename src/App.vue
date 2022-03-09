<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,

// 让 Vue 不要再对 font 标签发出警告了
import { getCurrentInstance } from '@vue/runtime-core'
getCurrentInstance()!.appContext.config.compilerOptions.isCustomElement = (tag) => tag === 'font'

import { initializeStuffStore } from "./stores/stuff";

// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Vitesse',
  meta: [
    { name: 'description', content: 'Opinionated Vite Starter Template' },
  ],
})

const isProduction = import.meta.env.MODE === 'production'

initializeStuffStore({
  entrypoint: (isProduction ? '/tuan' : ''),
  assetBaseUrl: (isProduction ? '/tuan' : '') + `/assets/tuan-data`,
  // Workaround: Github Pages 不能直接加载 lfs 文件
  lfsAssetBaseUrl: (isProduction ? (() => {
    const ghPagesUserName = /^(.*?)\./.exec(window.location.hostname)![1]
    return `https://media.githubusercontent.com/media/${ghPagesUserName}/tuan/gh-pages`
  })() : '') + `/assets/tuan-data`,
})

</script>

<template>
  <router-view />
</template>

<style lang="scss">
main {
  touch-action: manipulation;
}
</style>
<script setup lang="ts">
import { isDark, toggleDark } from '~/logic'

const { t, availableLocales, locale } = useI18n()

// @ts-ignore unused
const toggleLocales = () => {
  // change to some real logic
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>

<template lang="pug">
nav(w:text="3xl sm:2xl")
  .flex(class="items-center" w:flex="col" w:space="y-1.5")
    //-router-link.icon-btn(to="/" :title="t('button.home')")
      carbon-campsite
    button.icon-btn(class="!outline-none" :title="t('button.toggle_dark')" @click="toggleDark()")
      carbon-moon(v-if="isDark")
      carbon-sun(v-else)
    //-a.icon-btn(:title="t('button.toggle_langs')" @click="toggleLocales")
      carbon-language
    //-router-link.icon-btn(to="/about" :title="t('button.about')")
      carbon-dicom-overlay
    a.icon-btn(rel="noreferrer" href="https://github.com/FToovvr/tuan" target="_blank" title="GitHub")
      carbon-logo-github
</template>

<style scoped lang="scss">
.icon-btn {
  // 图标怎么也不居中，干脆就这样了
  width: 1.2em;
  height: 1.2em;

  // @apply my-0.5;
}
</style>
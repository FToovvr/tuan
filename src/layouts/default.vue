<template lang="pug">
main(class="px-4 pb-10 text-center text-gray-700 dark:(bg-gray-900 text-gray-200)")
  .fixed(
    class="top-6 right-3 sm:right-6 px-1 py-1.5 rounded-3xl" w:border="1 gray-500" style="z-index: 4;"
    w:bg="white dark:gray-900"
  )
    global-header
  router-view
</template>

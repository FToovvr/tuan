<template lang="pug">
.flex
    .dash
    div(w:p="x-2")
        slot
    .dash
</template>

<style scoped lang="scss">
.dash {
    @apply flex-1 h-0 m-auto border-1 border-dashed border-black dark:border-white;
}
</style>
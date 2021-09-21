<script setup lang="ts">
import QuestPostRefLink from './QuestPostRefLink.vue'

import DOMPurify from 'dompurify'

interface Props {
    content: string
}
const props = defineProps<Props>()

// let { content: _dirtyContent } = $(props)
let _dirtyContent = $(toRef(props, 'content'))
let cleanedContent = $computed(() => DOMPurify.sanitize(_dirtyContent))
let hasRefLink = $computed(() => cleanedContent.indexOf('<font') >= 0)
let content = $computed(() => {
    const dom = (new DOMParser()).parseFromString(`<div>${cleanedContent}</div>`, 'text/html')
    const rawRefLinks = dom.querySelectorAll('font[color="#789922"]')
    rawRefLinks.forEach((rawRefLink) => {
        const refPostId = Number(rawRefLink.textContent!.split('.')[1])
        const refLink = document.createElement('quest-post-ref-link')
        refLink.setAttribute(':post-id', String(refPostId))
        rawRefLink.parentElement!.replaceChild(refLink, rawRefLink)
    })
    return dom.documentElement.innerHTML
})
</script>

<template lang="pug">
.prose(w:text="left")
    div(w:whitespace="pre-line" w:leading="snug")
        template(v-if="hasRefLink")
            component(:is="{ template: content, components: { QuestPostRefLink } }")
        template(v-else)
            div(v-html="cleanedContent")
</template>
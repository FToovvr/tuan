<script setup lang="ts">
import type { FunctionalComponent } from '@vue/runtime-core'

import DOMPurify from 'dompurify'

import QuestPostRefLink from './QuestPostRefLink.vue'


interface Props {
    content: string

    nestLevel: number
    refRelativeDivId: number | null
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
        if (!/>>No\.\d+/.test(rawRefLink.textContent!)) {
            return
        }
        const refPostId = Number(rawRefLink.textContent!.split('.')[1])
        const refLink = document.createElement('quest-post-ref-link')
        refLink.setAttribute(':post-id', String(refPostId))
        refLink.setAttribute(':ref-relative-div-id', String(props.refRelativeDivId))
        // nest-level 从 QuestPostRefLink 起加深
        refLink.setAttribute(':nest-level', String(props.nestLevel + 1))
        rawRefLink.parentElement!.replaceChild(refLink, rawRefLink)
    })
    return dom.documentElement.querySelector('body')!.innerHTML
})

// 没找到要怎么为 `component(:is=…)` 设置编译选项，那就这么办了…
const inDev = process.env.NODE_ENV !== 'production'
const fontElem: FunctionalComponent | undefined = inDev ? (
    (props, context) => h('font', context.attrs, context.slots.default!())
) : undefined
</script>

<template lang="pug">
.prose(w:text="left")
    div(w:whitespace="pre-line" w:leading="snug")
        template(v-if="hasRefLink")
            component(:is="{ template: content, components: { QuestPostRefLink, ...(inDev ? { font: fontElem } : null) } }")
        template(v-else)
            div(v-html="cleanedContent")
</template>
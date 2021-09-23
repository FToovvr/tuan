<script setup lang="ts">
import type { Ref } from "vue"

interface Props {
    postId: number

    refRelativeDivId: number | null
}
const props = defineProps<Props>()
let postId = $(toRef(props, 'postId'))
let refRelativeDivId = $(toRef(props, 'refRelativeDivId'))

function onClick() {
    console.log(postId)
}

let refRelativeDiv = document.getElementById(`ref-relative-div-${refRelativeDivId}`)

let refPostAnchorRef: HTMLDivElement | null = $ref(null)
let refPostRef: HTMLDivElement | null = $ref(null)

// 悬浮的引用视图
let {
    onHovers, shouldFloat,
} = $(function useFloat(
    _refPostAnchorRef: Ref<HTMLDivElement | null>, _refPostRef: Ref<HTMLDivElement | null>,
    unfloatDelay: number = 100,
) {
    let refPostAnchorRef = $(_refPostAnchorRef)
    let refPostRef = $(_refPostRef)

    let onHovers = $ref({
        refLink: false,
        refPost: false,
    })
    let onHover = $computed(() => onHovers.refLink || onHovers.refPost)
    let justLeaved = $ref(false)
    watch($$(onHover), async (newValue) => {
        if (newValue === false) {
            justLeaved = true
            await new Promise((r) => setTimeout(r, unfloatDelay))
            justLeaved = false
        }
    })
    let shouldFloat = $computed(() => onHover || justLeaved)

    let _divSize = $ref({ width: 0, height: 0 })
    onMounted(() => {
        useResizeObserver(refRelativeDiv, (entries) => {
            const { width, height } = entries[0].contentRect
            _divSize = { width, height }
        })
    })
    const divSize = useThrottle($$(_divSize), 200)

    watch([$$(refPostAnchorRef), $$(refPostRef), divSize], () => {
        if (!refRelativeDiv || !refPostAnchorRef || !refPostRef) {
            return
        }
        const { top: elemTop, left: elemLeft } = refPostAnchorRef.getBoundingClientRect()
        const { top: bodyTop, left: bodyLeft } = refRelativeDiv.getBoundingClientRect()
        refPostRef.style.top = `${elemTop - bodyTop}px`
        refPostRef.style.left = `${elemLeft - bodyLeft}px`
    })

    return {
        onHovers: $$(onHovers), shouldFloat: $$(shouldFloat),
    }
}($$(refPostAnchorRef), $$(refPostRef), 100))

</script>

<template lang="pug">
span(
    style="color: #789922; cursor: zoom-in"
    w:font="mono" w:text="sm"
    @click="onClick" @mouseenter="onHovers.refLink = true" @mouseleave="onHovers.refLink = false"
) >>No.{{ postId }}
keep-alive
    div.ref-post-anchor(
        v-if="refRelativeDiv && shouldFloat"
        ref="refPostAnchorRef"
    )   
        //- 为了不感染上 `.prose`
        teleport(:to="refRelativeDiv")
            div.absolute(
                ref="refPostRef"
                @mouseenter="onHovers.refPost = true" @mouseleave="onHovers.refPost = false"
                style="z-index: 2;"
            )
                quest-post(:post-id="postId" :is-ref-post="true")
</template>

<style lang="scss">
.ref-post-anchor + br {
    display: none;
}
</style>
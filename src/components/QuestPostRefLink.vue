<script setup lang="ts">
import type { Ref } from "vue"

interface Props {
    postId: number

    nestLevel: number
    refRelativeDivId: number | null
}
const props = defineProps<Props>()
let postId = $(toRef(props, 'postId'))
let refRelativeDivId = $(toRef(props, 'refRelativeDivId'))

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

let isPinned = $ref(false)

function onClick() {
    isPinned = !isPinned
}

let refPostHeight = $ref(0)
watch($$(refPostRef), () => {
    if (!refPostRef) { return }
    refPostHeight = refPostRef.clientHeight ?? 0
    useResizeObserver(refPostRef, (entries) => {
        refPostHeight = entries[0].contentRect.height
    })
})

let displayStatus = $computed(() => {
    if (isPinned) {
        return 'open'
    }
    if (shouldFloat) {
        return 'floating'
    }
    return 'closed'
})

</script>

<template lang="pug">
span(
    style="color: #789922"
    :style="{ cursor: isPinned ? 'zoom-out' : 'zoom-in' }"
    w:font="mono" w:text="sm"
    @click="onClick" @mouseenter="onHovers.refLink = true" @mouseleave="onHovers.refLink = false"
) >>No.{{ postId }}
keep-alive
    //- FIXME: 引用视图 A->B->C，C 固定后，只有在鼠标移动到 B 外侧后 A 的高度才更新。
    div.ref-post-anchor(
        v-if="refRelativeDiv && (shouldFloat || isPinned)"
        ref="refPostAnchorRef"
        :style="{ height: isPinned ? `${refPostHeight}px` : 0 }"
    )   
        //- 为了不感染上 `.prose`
        teleport(:to="refRelativeDiv")
            div.absolute(
                ref="refPostRef"
                @mouseenter="onHovers.refPost = true" @mouseleave="onHovers.refPost = false"
                style="z-index: 2; width: max-content;"
                :style="{ maxWidth: `calc(100vw - ${refPostRef?.getBoundingClientRect().left ?? 0}px - ${1 + nestLevel * 0.2}em)` }"
            )
                quest-post(:post-id="postId" :nest-level="nestLevel")
                    template(#head-left)
                        span.pin-button(
                            :data-status="displayStatus"
                            w:text="xs" w:cursor="pointer"
                        ) 📌
                        span(class="px-0.5")
</template>

<style lang="scss">
.ref-post-anchor + br {
    display: none;
}
</style>

<style lang="scss" scoped>
// https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/src/style/style.scss
.pin-button {
    display: inline-block;
    transform: rotate(-45deg);

    &[data-status="floating"] {
        // https://codemyui.com/grayscale-emoji-using-css/
        transform: none;
        filter: grayscale(100%);
    }

    &[data-status="collapsed"]::before {
        content: "";
        position: absolute;
        height: 110%;
        width: 100%;
        background: linear-gradient(#f0e0d600, #f0e0d6ff);
        // z-index: $z-index-pin-mask;
        transform: rotate(45deg);
    }
}
</style>
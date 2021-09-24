<script setup lang="ts">
import type { ComputedRef, Ref, StyleValue } from "vue"

import { useBackgroundColor } from "~/logic/backgroundColor"

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

let refPostHeight = $ref(0)
watch($$(refPostRef), () => {
    if (!refPostRef) { return }
    refPostHeight = refPostRef.clientHeight ?? 0
    useResizeObserver(refPostRef, (entries) => {
        refPostHeight = entries[0].contentRect.height
    })
})

// TODO: 应该总共只计算一次，而不是每个组件实例都计算一次
// TODO: 高度的值应该固定在某处，而不是同时硬编码在这里和 QuestPost.vue 中 `article.container` 的 `:class` 绑定中
// https://stackoverflow.com/a/42769683
// 24 = 6rem
const collapseSize = 24 / 4.0 * parseFloat(getComputedStyle(document.documentElement).fontSize)

let isPinned = $ref(false)
let isCollapsed = $ref(false)
watch($$(isPinned), (isPinned) => { if (!isPinned) { isCollapsed = false } })
let displayStatus: 'closed' | 'floating' | 'open' | 'collapsed' = $computed(() => {
    if (isPinned) {
        return isCollapsed ? 'collapsed' : 'open'
    }
    if (shouldFloat) {
        return 'floating'
    }
    return 'closed'
})

let isCollapsible = $computed(() => refPostHeight > collapseSize)
function onClick(source: 'link' | 'pin') {
    if (!isPinned) {
        isPinned = true
    } else {
        if (source === 'link') {
            if (!isCollapsible) {
                return
            }
            isCollapsed = displayStatus === 'collapsed' ? false : true
        } else {
            isPinned = false
        }
    }
}

onMounted(() => {
    if (props.nestLevel === 1) {
        isPinned = true
        nextTick(() => {
            if (isCollapsible) {
                isCollapsed = true
            }
        })
    }
})

let backgroundColor = $(useBackgroundColor(computed(() => refPostRef?.firstElementChild as HTMLElement ?? null)))
let backgroundColorTransparent = $computed(() => backgroundColor + '00')
// Workaround，直接放在模板里会因为没有识别出是 CSS 变量而报错
let pinVarStyles = $(computed(() => ({ '--bg-color': backgroundColor, '--bg-color-t': backgroundColorTransparent })) as unknown as ComputedRef<StyleValue>)

</script>

<template lang="pug">
span(
    style="color: #789922"
    :style="{ cursor: (displayStatus === 'open') ? (isCollapsible ? 'zoom-out' : '') : 'zoom-in' }"
    w:font="mono" w:text="sm"
    @click="onClick('link')" @mouseenter="onHovers.refLink = true" @mouseleave="onHovers.refLink = false"
) >>No.{{ postId }}
keep-alive
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
                quest-post(
                    :post-id="postId" :nest-level="nestLevel" :is-collapsed="isCollapsed"
                    @expand="onClick('link')"
                )
                    template(#head-left)
                        span.pin-button(
                            :data-status="displayStatus"
                            w:text="xs" w:cursor="pointer"
                            :style="pinVarStyles"
                            @click="onClick('pin')"
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

    &[data-status="collapsed"] {
        transform: rotate(-225deg);
    }
    &[data-status="collapsed"]::before {
        content: "";
        position: absolute;
        height: 110%;
        width: 100%;
        /* 
            如果参数是：
            `v-bind(backgroundColorTransparent), v-bind(backgroundColor)`
            生成的 CSS 中相应变量会未定义
        */
        background: linear-gradient(var(--bg-color), var(--bg-color-t));
        transform: rotate(45deg);
    }
}
</style>
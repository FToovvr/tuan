<script setup lang="ts">
import type { Ref } from "vue"

import { useStuffStore } from "~/stores/stuff"
import { postBackgroundColor } from "~/logic/backgroundColor"
import { remToPx } from "~/logic/units"

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

let stuffStore = useStuffStore()

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

// 帖当前的高度（不包含由于折叠被隐藏的高度）
let refPostHeight = $ref(0)
// 帖整体的高度（包含由于折叠被隐藏的高度）
let refPostFullHeight = $ref(0)
watch($$(refPostRef), () => {
    if (!refPostRef) { return }

    for (const { heightRef, el } of [
        { heightRef: $$(refPostHeight), el: refPostRef },
        { heightRef: $$(refPostFullHeight), el: refPostRef.querySelector('.quest-post-wrapper')! as unknown as HTMLElement },
    ]) {
        heightRef.value = el.clientHeight ?? 0
        useResizeObserver(el, (entries) => {
            heightRef.value = entries[0].contentRect.height
        })
    }
})

// TODO: 应该总共只计算一次，而不是每个组件实例都计算一次
// TODO: 高度的值应该固定在某处，而不是同时硬编码在这里和 QuestPost.vue 中 `article.container` 的 `:class` 绑定中
// https://stackoverflow.com/a/42769683
// 24 = 6rem
const collapseSize = remToPx(24 / 4.0)

// FIXME?: 如果拉宽页面使得一个原本折叠的引用视图高度低于折叠高度，该引用视图依旧会处于折叠状态
let {
    displayStatus, isPinned, isCollapsed, isCollapsible, eagersToCollapse, onClick
} = $(function useFix(collapseSize: number, _fullHeight: Ref<number>) {
    let fullHeight = $(_fullHeight)

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

    let isCollapsible = $computed(() => fullHeight > collapseSize)
    let eagersToCollapse = $ref(false) // 在有交互前，如果高度允许折叠则折叠
    function onClick(source: 'link' | 'pin') {
        eagersToCollapse = false
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

    return {
        displayStatus: $$(displayStatus),
        isPinned: $$(isPinned), isCollapsed: $$(isCollapsed), isCollapsible: $$(isCollapsible),
        eagersToCollapse: $$(eagersToCollapse),
        onClick,
    }
}(collapseSize, $$(refPostFullHeight)))


watch($$(refPostHeight), () => {
    if (eagersToCollapse && isCollapsible) {
        isCollapsed = true
        eagersToCollapse = false
    }
})

// 让第一层引用视图自动固定并折叠
// FIXME: 偶尔有图片的时候折叠会失效？
onMounted(() => {
    if (props.nestLevel === 1) {
        isPinned = true
        nextTick(() => {
            if (isCollapsible) {
                isCollapsed = true
            } else {
                eagersToCollapse = true
            }
        })
    }
})


</script>

<template lang="pug">
span(
    style="color: #789922"
    :style="{ cursor: (displayStatus === 'open') ? (isCollapsible ? 'zoom-out' : '') : 'zoom-in' }"
    w:font="mono" w:text="sm"
    @click="onClick('link')" @mouseenter="onHovers.refLink = true" @mouseleave="onHovers.refLink = false"
) >>No.{{ postId }}
keep-alive
    .ref-post-anchor(
        v-if="refRelativeDiv && (shouldFloat || isPinned)"
        ref="refPostAnchorRef"
        :style="{ height: isPinned ? `${refPostHeight}px` : 0 }"
    )   
        //- 为了不感染上 `.prose`
        teleport(:to="refRelativeDiv")
            .absolute(
                ref="refPostRef"
                @mouseenter="onHovers.refPost = true, eagersToCollapse = false" @mouseleave="onHovers.refPost = false"
                style="z-index: 2; width: max-content;"
                :style="{ maxWidth: `calc(${(stuffStore.rootPostWidth ?? 0)}px - ${1.5 /* TODO: 不该 hardcode */ * nestLevel}rem - ${nestLevel * 0.2}rem)` }"
            )
                quest-post(
                    :post-id="postId" :nest-level="nestLevel" :is-collapsed="isCollapsed"
                    @expand="onClick('link')"
                )
                    template(#head-left)
                        .inline-block.relative
                            overflow-mask(
                                v-if="isCollapsed"
                                @click="onClick('pin')" w:cursor="pointer"
                                height="1em" :background-color-rgb-hex="postBackgroundColor"
                            )
                            span.pin-button(
                                :data-status="displayStatus"
                                w:text="xs"
                                @click="onClick('pin')" w:cursor="pointer"
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
}
</style>
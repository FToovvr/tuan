<script setup lang="ts">
import type { Ref } from "vue"

import { useStuffStore } from "~/stores/stuff"
import { postBackgroundColor } from "~/logic/backgroundColor"
import { remToPx } from "~/logic/units"
import zIndexes from "~/logic/zIndexes"
import { postContentDivKey, siblingRefLinkCountKey } from "~/logic/injectKeys"

interface Props {
    postId: number

    // 处于第几层嵌套，最外层的帖为 0
    nestLevel: number
    // 属于同一层的第几个引用链接
    order: number
}
const props = defineProps<Props>()
let postId = $(toRef(props, 'postId'))

let refRelativeDiv = $(inject(postContentDivKey))

let refPostAnchorRef: HTMLDivElement | null = $ref(null)
let refPostRef: HTMLDivElement | null = $ref(null)

let stuffStore = useStuffStore()

let maxWidth = $computed(() => {
    const indentSpace = '0.75rem' // TODO: 不该 hardcode
    const rootWidth = `${stuffStore.rootPostWidth!}px`

    const leftSpace = `(${indentSpace} * ${props.nestLevel + 1})`
    const rightSpace = `(0.2em * ${props.nestLevel})`

    return `calc(${rootWidth} - ${leftSpace} - ${rightSpace})`
})

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
        // @ts-ignore Property 'getBoundingClientRect' does not exist on type 'DestructureRefs<Ref<HTMLDivElement | null>>'
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
let refPostWidth = $ref(0)
// 帖整体的高度（包含由于折叠被隐藏的高度）
let refPostFullHeight = $ref(0)
watch($$(refPostRef), () => {
    if (!refPostRef) { return }

    const fullEl = refPostRef.querySelector('.quest-post-wrapper') as HTMLElement | null
    for (const { heightRef, widthRef, el } of [
        { heightRef: $$(refPostHeight), widthRef: $$(refPostWidth), el: refPostRef },
        { heightRef: $$(refPostFullHeight), widthRef: null, el: fullEl! },
    ]) {
        heightRef.value = el.clientHeight ?? 0
        if (widthRef) { widthRef.value = el.clientWidth ?? 0 }
        useResizeObserver(el, (entries) => {
            heightRef.value = entries[0].contentRect.height
            if (widthRef) { widthRef.value = entries[0].contentRect.width }
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
    // 如果为真，在有交互前，如果高度允许折叠则折叠
    let eagersToCollapse = $ref(false)
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


watch($$(refPostFullHeight), () => {
    if (eagersToCollapse && isCollapsible) {
        isCollapsed = true
        eagersToCollapse = false
    }
})

// 让第一层引用视图自动固定并折叠
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

let siblingRefLinkCount = $(inject(siblingRefLinkCountKey))
// @ts-ignore The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
const refPostZIndex = zIndexes.refPost + (siblingRefLinkCount - props.order)

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
        :style="isPinned ? { height: `${refPostHeight}px`, width: `${refPostWidth}px` } : undefined"
    )   
        //- 为了不感染上 `.prose`
        teleport(:to="refRelativeDiv")
            //- 由于处于 teleport 内，目前 CSS 中的 v-bind 无效， z-index 在这里嵌入
            .absolute(
                ref="refPostRef"
                @mouseenter="onHovers.refPost = true, eagersToCollapse = false" @mouseleave="onHovers.refPost = false"
                style="width: max-content;"
                :style="{ zIndex: refPostZIndex, maxWidth: maxWidth }"
            )
                quest-post-loader(
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
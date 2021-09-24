import type { ComputedRef, Ref } from "vue";
import { isDark } from ".";

// XXX: 不能有 alpha 值
// 总觉得不够优雅：从简的话，应该全局只有一处 `watch`；从繁的话，只观察 `isDark` 是不够的
export function useBackgroundColor(_elRef: Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>) {
    let elRef = $(_elRef)

    let backgroundColor = $ref('#000000')

    watch([isDark, $$(elRef)], () => {
        if (!elRef) { return }

        const bgRgb = window.getComputedStyle(elRef).getPropertyValue('background-color')
        // @ts-ignore
        // https://stackoverflow.com/a/3627747
        const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`
        const bgHex = rgb2hex(bgRgb)
        console.log(bgHex)
        backgroundColor = bgHex
    }, { immediate: true, flush: 'post' })

    return $$(backgroundColor)
}
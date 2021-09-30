import type { ComputedRef, Ref } from "vue";
import { isDark } from ".";

// https://stackoverflow.com/a/3627747
export function rgbToHex(rgb: string) {
    return `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)!.slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`
}

// XXX: 为了能让 JIT 检测到，必须要在外面加 `text-` 前缀，或者加到 SafeList
function getTailwindColor(colorName: string) {
    const div = document.createElement('div')
    div.className = `${colorName}`
    document.body.appendChild(div)
    const color = rgbToHex(window.getComputedStyle(div).getPropertyValue('color'))
    div.remove()
    return color
}

export const colorVariants = (() => {
    if (!import.meta.env.SSR) {
        return {
            app: {
                background: {
                    light: getTailwindColor('text-white'),
                    dark: getTailwindColor('text-black'), //getTailwindColor('text-gray-900'),
                },
            },
            post: {
                background: {
                    light: getTailwindColor('text-post-background-color'),
                    dark: getTailwindColor('text-post-background-color-dark'),
                }
            },
        }
    }
    return null
})()

export const appBackgroundColor = computed(() => colorVariants!.app.background![isDark.value ? 'dark' : 'light'])
export const postBackgroundColor = computed(() => colorVariants!.post.background[isDark.value ? 'dark' : 'light'])

// XXX: 不能有 alpha 值
/**
 * @deprecated
 */
export function useBackgroundColor(_elRef: Ref<HTMLElement | null> | ComputedRef<HTMLElement | null>) {
    let elRef = $(_elRef)

    let backgroundColor = $ref('#000000')

    watch([isDark, $$(elRef)], () => {
        if (!elRef) { return }
        backgroundColor = rgbToHex(window.getComputedStyle(elRef).getPropertyValue('background-color'))
    }, { immediate: true, flush: 'post' })

    return $$(backgroundColor)
}
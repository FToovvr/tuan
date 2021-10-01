import type { Ref } from "vue";
import type { InjectionKey } from "@vue/runtime-core";

export const postContentDivKey: InjectionKey<Ref<HTMLDivElement | null>> = Symbol()
export const siblingRefLinkCountKey: InjectionKey<Ref<number>> = Symbol()
// 暂无 inject
export const isInsideCollapsedKey: InjectionKey<Ref<boolean>> = Symbol()

// 用于更新 URL
export const currentPageNumberKey: InjectionKey<Ref<number>> = Symbol()
export const currentPostIdKey: InjectionKey<Ref<number | null>> = Symbol()

// 帖所在页的页数
export const pageNumberKey: InjectionKey<Ref<number | null>> = Symbol()
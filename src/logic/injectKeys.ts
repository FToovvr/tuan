import type { Ref } from "vue";
import type { InjectionKey } from "@vue/runtime-core";

export const postContentDivKey: InjectionKey<Ref<HTMLDivElement | null>> = Symbol()
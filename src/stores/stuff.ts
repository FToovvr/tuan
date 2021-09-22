import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Quest } from '~/types/quest'
import type { RawPostJson } from '~/types/post'

export const useStuffStore = defineStore('stuff', {
  state: () => ({
    baseUrl: null as string | null, // XXX: 初始化后不应改变

    quests: new Map<string, Quest>(),
    currentQuest: null as Quest | null,
  }),
  actions: {

    async loadCurrentQuest(folder: string, questName: string) {
      this.currentQuest = await this.loadQuest(folder, questName)
    },

    async loadQuest(folder: string, questName: string) {
      const path = `${folder}/${questName}`
      if (this.quests.has(path)) {
        return this.quests.get(path)!
      }
      if (!this.baseUrl) {
        throw new Error('baseUrl is null')
      }

      let quest = $ref({
        baseUrl: this.baseUrl,
        folder, name: questName,
        postOwner: 'bb82mcm', // TODO
        posts: null,
      } as Quest)
      this.quests.set(path, quest)

      const data = await (await fetch(`${this.baseUrl}/${path}/data.json`)).json() as RawPostJson[]
      quest.posts = data

      return quest
    }

  }
})

export function initializeStuffStore(baseUrl: string) {
  const store = useStuffStore()
  store.baseUrl = baseUrl
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStuffStore, import.meta.hot))

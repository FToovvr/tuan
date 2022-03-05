import { acceptHMRUpdate, defineStore } from 'pinia'

import type { Quest } from '~/types/quest'
import { Post, RawPostJson, rawPostToPost } from '~/types/post'

export const useStuffStore = defineStore('stuff', {
  state: () => ({
    baseUrl: null as string | null, // XXX: 初始化后不应改变
    lfsBaseUrl: null as string | null,

    quests: new Map<string, Quest>(),
    currentQuest: null as Quest | null,

    // 最外层帖的宽度
    rootPostWidth: 0,

    postToScrollTo: null as number | null,
    isInAutoScrolling: false,
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
      if (!this.baseUrl || !this.lfsBaseUrl) {
        throw new Error(`baseUrl(${this.baseUrl}) or lfsBaseUrl(${this.lfsBaseUrl}) is null`)
      }

      let quest = $ref({
        baseUrl: this.baseUrl,
        lfsBaseUrl: this.lfsBaseUrl,
        folder, name: questName,
        postOwner: 'bb82mcm', // TODO
        posts: null,
        idFloorLookup: new Map()
      } as Quest)

      const data = await (await fetch(`${this.baseUrl}/${path}/data.json`)).json() as RawPostJson[]

      const posts: Post[] = []
      const idFloorLookup = new Map<number, number>()
      data.forEach((rawPost, i) => {
        const floorNumber = i + 1
        posts.push(rawPostToPost(rawPost, quest, floorNumber))
        idFloorLookup.set(rawPost.id, floorNumber)
      })

      quest.posts = posts
      quest.idFloorLookup = idFloorLookup
      this.quests.set(path, quest)

      return quest
    }

  }
})

export function initializeStuffStore(args: { baseUrl: string, lfsBaseUrl: string }) {
  const store = useStuffStore()
  store.baseUrl = args.baseUrl
  store.lfsBaseUrl = args.lfsBaseUrl
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStuffStore, import.meta.hot))

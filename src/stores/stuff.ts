import { acceptHMRUpdate, defineStore } from 'pinia'

export const useStuffStore = defineStore('stuff', {
  
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStuffStore, import.meta.hot))

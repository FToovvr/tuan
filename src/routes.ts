import { RouteRecordRaw } from 'vue-router'

import Page from './pages/QuestThreadPage.vue'

export default [
    { path: '/folder-:folder/quest-:quest/:page', component: Page }
] as RouteRecordRaw[]
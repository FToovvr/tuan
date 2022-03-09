import { RouteRecordRaw } from "vue-router";
import { assetBaseUrl } from "./env";

import Page from "./pages/QuestThreadPage.vue";
import PageLegacy from "./pages/QuestThreadPageLegacy.vue";

export default [
  { path: `${assetBaseUrl}/quests/:id/pages/:page`, component: Page },
  {
    path: `${assetBaseUrl}/folder-:folder/quest-:quest/:page`,
    component: PageLegacy,
  },
] as RouteRecordRaw[];

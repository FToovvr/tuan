import { RouteRecordRaw } from "vue-router";
import { baseUrl } from "./env";

import Page from "./pages/QuestThreadPage.vue";

export default [
  { path: `${baseUrl}/folder-:folder/quest-:quest/:page`, component: Page },
] as RouteRecordRaw[];

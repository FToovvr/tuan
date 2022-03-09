import { RouteRecordRaw } from "vue-router";
import { entrypoint } from "./env";

import Page from "./pages/QuestThreadPage.vue";
import PageLegacy from "./pages/QuestThreadPageLegacy.vue";

export default [
  {
    path: `${entrypoint}/quests/:id/pages/:page`,
    component: Page,
  },
  {
    path: `${entrypoint}/quests/:id`,
    redirect: (to) => {
      const toPathWithSlash = to.path.endsWith("/") ? to.path : `${to.path}/`;
      return { ...to, path: `${toPathWithSlash}pages/1` };
    },
  },
  {
    path: `${entrypoint}/folder-:folder/quest-:quest/:page`,
    component: PageLegacy,
  },
] as RouteRecordRaw[];

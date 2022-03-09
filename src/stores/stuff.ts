import { acceptHMRUpdate, defineStore } from "pinia";
import { entrypoint } from "~/env";

import { Quest } from "~/logic/quest";
import type {
  QuestCollectionQuestRaw,
  QuestCollectionRaw,
} from "~/types/quest-collection";

export const useStuffStore = defineStore("stuff", {
  state: () => ({
    isInitialized: false,

    entrypoint: null as string | null,
    assetBaseUrl: null as string | null, // XXX: 初始化后不应改变
    lfsAssetBaseUrl: null as string | null,

    collection: null as {
      quests: Map</* id */ string, QuestCollectionQuestRaw>;
      legacyPathToId: Map</* `${folder}/${quest}` */ string, string>;
      shardsInfo: {
        pagesPerShard: number;
        postsPerPage: number;
      };
    } | null,

    loadedQuests: new Map<string, Quest>(),
    currentQuest: null as Quest | null,

    // 最外层帖的宽度
    rootPostWidth: 0,

    postToScrollTo: null as number | null,
    isInAutoScrolling: false,
  }),
  // XXX: 这些 actions 要确保 isInAutoScrolling === true 后才可以调用
  actions: {
    async loadCurrentQuestLegacy(folder: string, questName: string) {
      const id = this.convertLegacyPathToId(folder, questName);
      console.assert(id !== undefined);
      this.loadCurrentQuest(id!);
    },

    convertLegacyPathToId(folder: string, questName: string) {
      return this.collection?.legacyPathToId.get(`${folder}/${questName}`);
    },

    async loadCurrentQuest(id: string) {
      this.currentQuest = await this.loadQuest(id);
      console.log(this.currentQuest);
    },

    // XXX: 注意每个团只调用一次（包括 `loadCurrentQuest`, `loadCurrentQuestLegacy`）
    async loadQuest(id: string) {
      const folderName = Quest.convertIdToFolderName(id);
      if (this.loadedQuests.has(id)) {
        return this.loadedQuests.get(id)!;
      }
      if (!this.assetBaseUrl || !this.lfsAssetBaseUrl) {
        throw new Error(
          `baseUrl(${this.assetBaseUrl}) or lfsBaseUrl(${this.lfsAssetBaseUrl}) is null`,
        );
      }

      let quest = await Quest.build({
        id,
        dataBasePath: `${this.assetBaseUrl}/${folderName}`,
        ...this.collection!.shardsInfo,
      });

      this.loadedQuests.set(id, quest);

      return quest;
    },
  },
});

export function initializeStuffStore(
  args: {
    entrypoint: string;
    assetBaseUrl: string;
    lfsAssetBaseUrl: string;
  },
) {
  const store = useStuffStore();
  store.entrypoint = args.entrypoint;
  store.assetBaseUrl = args.assetBaseUrl;
  store.lfsAssetBaseUrl = args.lfsAssetBaseUrl;

  new Promise(async () => {
    const collection =
      await (await fetch(`${entrypoint}/assets/tuan-data/collection.json`))
        .json() as QuestCollectionRaw;

    const quests = new Map<string, QuestCollectionQuestRaw>();
    const legacyPathToId = new Map<string, string>();
    for (const quest of collection.index) {
      quests.set(quest.id, quest);
      if (quest.legacyPath) {
        legacyPathToId.set(
          `${quest.legacyPath.folder}/${quest.legacyPath.quest}`,
          quest.id,
        );
      }
    }

    store.collection = {
      quests,
      legacyPathToId,
      shardsInfo: collection.shardsInfo,
    };

    store.isInitialized = true;
  });
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStuffStore, import.meta.hot));
}

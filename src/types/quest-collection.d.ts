export interface QuestCollectionQuestRaw {
  id: string;
  name: string;
  po: string | string[] | null;
  postCount: number;

  legacyPath?: { folder: string; quest: string };
}

export interface QuestCollectionRaw {
  index: QuestCollectionQuestRaw[];
  shardsInfo: {
    pagesPerShard: number;
    postsPerPage: number;
  };
}

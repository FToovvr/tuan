import Papa from "papaparse";
import binarySearch from "binary-search";
import type { RawPostJson } from "./post";

export interface Shard {
  initialized: boolean;

  idRange: { from: number; to: number };
  posts: RawPostJson[];
}

// 注：碎片、楼层以 0 为基准；页面以 1 为基准
export class Quest {
  id: string;

  // 仅用于内部处理的信息
  // data 的 base path
  dataBasePath: string;
  pagesPerShard: number;
  postsPerPage: number;

  // 基本信息
  name: string;
  postOwner: string | string[] | null;
  postCount: number;

  // 来源于已提前生成的文件，用于快速查找引用帖子的 ID 对应的碎片
  refShardLookup: Map<number, number> | Promise<Map<number, number>> | null =
    null;

  // 未载入的碎片是 null，载入的 shard 记录其收录帖子的范围
  shards: (Shard | Promise<Shard> | null)[];
  // 帖子串号 -> 对应的楼层数，以 0 开始
  postFloorLookup: Map<number, number>;

  private constructor(
    args: {
      id: string;
      dataBasePath: string;
      pagesPerShard: number;
      postsPerPage: number;
    },
    info: QuestInfo,
  ) {
    this.id = args.id;
    this.dataBasePath = args.dataBasePath;
    this.pagesPerShard = args.pagesPerShard;
    this.postsPerPage = args.postsPerPage;
    const postsPerShard = this.pagesPerShard * this.postsPerPage;

    console.assert(this.id === info.id);
    this.name = info.name;
    this.postOwner = info.po;
    this.postCount = info.postCount;

    const shardCount = Math.floor((this.postCount - 1) / postsPerShard) + 1;
    this.shards = new Array(shardCount).fill(null);
    this.postFloorLookup = new Map<number, number>();
  }

  static async build(
    args: {
      id: string;
      dataBasePath: string;
      pagesPerShard: number;
      postsPerPage: number;
    },
  ) {
    const info = await (await fetch(`${args.dataBasePath}/tuan.json`))
      .json() as QuestInfo;
    return new Quest(args, info);
  }

  async getPage(pageNumber: number): Promise<RawPostJson[]> {
    const { inShard, inShardRange } = this.getPagePosition(pageNumber);
    const shard = await this.getShard(inShard);
    return shard.posts.slice(inShardRange.from, inShardRange.to + 1);
  }

  async getRefPost(id: number): Promise<RawPostJson | null> {
    const floor = this.postFloorLookup.get(id);
    if (floor !== undefined) {
      const floorPosition = this.getFloorPosition(floor);
      const shard = await this.getShard(floorPosition.inShard);
      return shard.posts[floorPosition.inShardOffset];
    }

    const lookup = await this.getRefShardLookup();
    const inShard = lookup.get(id);
    if (!inShard) {
      return null;
    }
    const shard = await this.getShard(inShard);
    const inShardOffset = binarySearch(
      shard.posts,
      id,
      (element, needle) => element.id - needle,
    );
    console.assert(inShardOffset >= 0);
    return shard.posts[inShardOffset];
  }

  getPagePosition(pageNumber: number) {
    const inShardIndex = (pageNumber - 1) % this.pagesPerShard;
    return {
      inShard: Math.floor((pageNumber - 1) / this.pagesPerShard),
      inShardRange: {
        from: inShardIndex * this.postsPerPage,
        to: (inShardIndex + 1) * this.postsPerPage - 1,
      },
    };
  }

  // 注：floor 从 0 起标号
  getFloorPosition(floor: number) {
    const inPage = Math.floor(floor / this.postsPerPage) + 1;
    const inPageOffset = floor % this.postsPerPage;
    const pagePosition = this.getPagePosition(inPage);
    return {
      inShard: pagePosition.inShard,
      inShardOffset: pagePosition.inShardRange.from + inPageOffset,
    };
  }

  // 用于保证一个碎片只会获取一次
  async getShard(shardId: number): Promise<Shard> {
    // console.trace({ shardId, shard: this.shards[shardId] });
    const shardCapacity = this.pagesPerShard * this.postsPerPage;
    if (!this.shards[shardId]) {
      this.shards[shardId] = Quest.fetchShard(
        shardId,
        {
          shardCapacity,
          postCount: this.postCount,
          dataBasePath: this.dataBasePath,
        },
      );
      this.shards[shardId] = await this.shards[shardId];
    }
    const shard = await this.shards[shardId]!;
    if (!shard.initialized) {
      shard.initialized = true;
      const startFloor = shardId * shardCapacity;
      for (const [i, post] of shard.posts.entries()) {
        this.postFloorLookup.set(post.id, startFloor + i);
      }
    }
    return shard;
  }

  static async fetchShard(
    shardId: number,
    args: { shardCapacity: number; postCount: number; dataBasePath: string },
  ): Promise<Shard> {
    const [start, end] = [
      shardId * args.shardCapacity,
      Math.min(args.postCount - 1, (shardId + 1) * args.shardCapacity - 1),
    ];

    const shardFileName = `[${shardId}]${start}-${end}.csv`;
    const shardCsvText =
      await (await fetch(`${args.dataBasePath}/shards/${shardFileName}`))
        .text();
    if (shardCsvText.charCodeAt(0) === 0xFEFF) {
      shardCsvText.substring(1);
    }
    const parsed = Papa.parse(shardCsvText, { header: true });

    const posts = parsed.data.map((row: any): RawPostJson => {
      const post: RawPostJson = {
        id: Number(row.id),
        created_at: Number(row.created_at),
        user_id: row.user_id,
        content: row.content,
      };

      if (row.title) {
        post.title = row.title;
      }
      if (row.name) {
        post.name = row.name;
      }
      if (row.attachment_base) {
        post.attachment_base = row.attachment_base;
      }
      if (row.attachment_extension) {
        post.attachment_extension = row.attachment_extension;
      }
      return post;
    });

    return {
      initialized: false,

      idRange: { from: posts[0].id, to: posts[posts.length - 1].id },
      posts,
    };
  }

  // 用于保证获取一次
  async getRefShardLookup() {
    if (!this.refShardLookup) {
      this.refShardLookup = await (async () => {
        const refIndexCSVText =
          await (await fetch(`${this.dataBasePath}/ref-index.csv`)).text();
        const parsed = Papa.parse(refIndexCSVText);
        const data = parsed.data as any;
        const map = new Map<number, number>();
        for (let i = 1 /* 0 是 header */; i < data.length; i++) {
          map.set(data.refId, data.atShard);
        }
        return map;
      })();
    }
    return await this.refShardLookup;
  }

  static convertIdToFolderName(id: string) {
    // 复制自 `scripts/build-tuan-data` 中对应函数
    const parts = id.split(":");
    const last = parts.splice(parts.length - 1, 1);
    return parts.map((x) => `[${x}]`).join("") + last;
  }
}

// 存于 tuan.json 中的内容的格式
export interface QuestInfo {
  id: string;
  name: string;
  po: string | string[] | null;
  postCount: number;
}

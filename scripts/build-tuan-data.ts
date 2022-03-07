export {};

/// 处理 /tuan-data 中的数据，输出到 /public/assets/tuan-data 对应位置
/// 之所以用 deno 是因为

//@ts-ignore
import fs, { promises as fsP } from "fs";
//@ts-ignore
import path from "path";

import fsE from "fs-extra";
import yaml from "js-yaml";
import binarySearch from "binary-search";
import Papa from "papaparse";

const outPath = "tuan-data-dist";
const tuanDataBasePath = `${outPath}/tuan-collection`;

async function main() {
  // 总之目前先简单粗暴地把之前生成的记录删掉
  // TODO: 缓存功能
  if (fs.existsSync(outPath)) {
    await fsP.rmdir(outPath, { recursive: true });
  }
  await fsP.mkdir(outPath, { recursive: true });

  const tuanCollection: TuanInfoFinal[] = [];

  await walkDir("tuan-data", async (dirPath) => {
    if (fs.existsSync(path.join(dirPath, "tuan.yaml"))) {
      const tuanInfo = await buildTuan(dirPath);
      tuanCollection.push(tuanInfo);
      return false;
    }
    return true;
  });

  await fsP.mkdir(tuanDataBasePath, { recursive: true });
  const tuanCollectionText = JSON.stringify(
    { index: tuanCollection, shardsInfo: { postsPerShard: 20 * 19 } },
    null,
    "\t",
  );
  await fsP.writeFile(
    `${tuanDataBasePath}/collection.json`,
    tuanCollectionText,
  );
}

// TODO
type Post = any;

interface TuanInfo {
  id: string;

  name: string;
  po: string | string[] | null;
}

interface TuanInfoFinal {
  id: string;
  name: string;
  po: string | string[] | null;
  postCount: number;
  // 这些数据（包括上面的 `postCount`）足以推导出都有哪些碎片
  // shardsInfo: { postsPerShard: number };
}

// 团的碎片，可以包含许多页的内容
interface TuanShard {
  // 本碎片包含的帖子的位移范围
  offsetRange: { from: number; to: number };
  // 帖子
  posts: Post[];
  // 引用串号 -> 该串号帖子的位移
  // TODO: 外部串的引用
  // null: 没有, undefined: 还没去找
  refIndex: { [key: number]: number | null | undefined };
}

// interface shardsInfo {
//   shards: {
//     offsetRange: { from: number; to: number };
//   }[];
// }

async function buildTuan(basePath: string) {
  const infoPath = path.join(basePath, "tuan.yaml");
  const _info = await fsP.readFile(infoPath, "utf-8");
  const info = yaml.load(_info.toString()) as TuanInfo;

  const rawThreadPath = path.join(basePath, "raw-thread.json");
  const _rawThread = await fsP.readFile(rawThreadPath, "utf8");
  const rawThread = JSON.parse(_rawThread.toString()) as Post[];

  const tuanFolderPath = `${tuanDataBasePath}/${info.id}`;
  await fsP.mkdir(tuanFolderPath, { recursive: true });

  const shards: TuanShard[] = [];
  const refShardMap = new Map<number, number>();
  // 将整个串切成碎片
  // 每个碎片包含 “20 页 * 19 帖/页” 的内容
  for (let i = 0; i < rawThread.length; i += 20 * 19) {
    const shard: TuanShard = {
      offsetRange: { from: i, to: i + 20 * 19 - 1 },
      posts: rawThread.slice(i, i + 20 * 19),
      refIndex: {},
    };
    shards.push(shard);

    for (const post of shard.posts) {
      refShardMap.set(post.id, shards.length - 1);
      const matches = post.content.matchAll(/&gt;&gt;No\.\d+/g);
      for (const [match] of [...matches]) {
        const refId = Number(match.slice(11));
        const isAlreadyInShard =
          binarySearch(shard.posts, refId, (element, needle) =>
            element.id - needle) >= 0;
        if (!isAlreadyInShard) {
          shard.refIndex[refId] = undefined;
        }
      }
    }
  }

  const shardsPath = path.join(tuanFolderPath, "shards");
  await fsP.mkdir(shardsPath, { recursive: true });

  // 将切成的碎片各个写入文件，存储格式为 CSV
  for (const [i, shard] of shards.entries()) {
    // 记录一下每个碎片中，不包含在碎片里的引用内容有哪些
    for (const ref of Object.keys(shard.refIndex)) {
      const inWhichShard = refShardMap.get(Number(ref));
      shard.refIndex[Number(ref)] = inWhichShard ?? null;
    }

    const shardFilePath = path.join(
      shardsPath,
      `${i}:${shard.offsetRange.from}-${shard.offsetRange.to}.csv`,
    );
    const postsCsv = Papa.unparse(shard.posts, {
      columns: [
        "id",
        "created_at",
        "user_id",
        "content",
        "attachment_base",
        "attachment_extension",
        "title",
        "name",
      ],
    });
    await fsP.writeFile(shardFilePath, postsCsv);
  }

  const finalInfo: TuanInfoFinal = {
    id: info.id,
    name: info.name,
    po: info.po,

    postCount: rawThread.length,
    // 这些数据（包括上面的 `postCount`）足以推导出都有哪些碎片
    // shardsInfo: {
    //   postsPerShard: 20 * 19,
    // },
  };

  const finalInfoText = JSON.stringify(finalInfo, null, "\t");
  await fsP.writeFile(path.join(tuanFolderPath, "tuan.json"), finalInfoText);

  const refIndexForAll = shards.map((shard) => shard.refIndex).reduce(
    (prev, cur) => ({ ...prev, ...cur }),
    {},
  );
  const refIndexText = Papa.unparse({
    fields: ["refId", "atShard"],
    data: Object.entries(refIndexForAll).filter(([_, value]) => value !== null),
  });
  await fsP.writeFile(path.join(tuanFolderPath, "ref-index.csv"), refIndexText);

  // FIXME: 太慢了
  await fsE.copy(
    path.join(basePath, "attachments"),
    path.join(tuanFolderPath, "attachments"),
  );

  return finalInfo;
}

// tuan-data/[xx]xxxx:
// tuan.json
// shards/0-379.json { posts, "ref-indexes" }
// attachments/…

// collections.json

await main();

/**
 * 漫游一个文件夹，为其中的每个文件夹调用一次 cb。
 *
 * 改自 https://gist.github.com/lovasoa/8691344
 *
 * @param path 要漫游的文件夹
 * @param cb callback，根据其返回值：true 则继续深入，false 则停止深入
 */
async function walkDir(
  dirPath: string,
  cb: (dirPath: string) => Promise<boolean> | boolean,
) {
  for await (const entry of await fsP.opendir(dirPath)) {
    if (entry.isDirectory()) {
      const subPath = path.join(dirPath, entry.name);
      if (await cb(subPath)) {
        await walkDir(subPath, cb);
      }
    }
  }
}

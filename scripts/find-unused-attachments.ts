/// USAGE: `pnpm run find-unused-attachments "tuan-data/收录/[团版]机制串"`
///   建完 `unused` 文件夹后：
///     `cd "tuan-data/收录/[团版]机制串"; mkdir "attachments/unused"; pnpm run find-unused-attachments "$(pwd)" | xargs -I{} mv "attachments/{}" "attachments/unused/"; cd -`

//@ts-ignore
import { promises as fsP } from "fs";
//@ts-ignore
import path from "path";

async function main() {
  //@ts-ignore "Cannot find name 'process'"
  const tuanBasePath = process.argv[2];

  const rawThreadText = (await fsP.readFile(
    path.join(tuanBasePath, "raw-thread.json"),
    "utf8",
  ));
  const rawThread = JSON.parse(rawThreadText);

  const attachments = new Set<string>();

  for (const post of rawThread) {
    if (post.attachment_base) {
      const fullPath = post.attachment_base + post.attachment_extension;
      const name = /\/(.*)/.exec(fullPath)![1];
      attachments.add(name);
    }
  }

  // console.log(attachments);

  for await (
    const entry of await fsP.opendir(path.join(tuanBasePath, "attachments"))
  ) {
    if (!attachments.has(entry.name)) {
      console.log(entry.name);
    }
  }
}

await main();

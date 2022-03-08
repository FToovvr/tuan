import type { Quest } from "./quest";

export interface Post {
  postId: number;
  floorNumber: number;
  createdAtUtc: number;
  userId: string;
  isPostOwner: boolean;
  content: string;

  imageUrl?: string;
}

export interface RawPostJson {
  id: number;
  created_at: number;
  user_id: string;
  content: string;

  title?: string;
  name?: string;
  attachment_base?: string;
  attachment_extension?: string;
}

export function rawPostToPost(
  raw: RawPostJson,
  quest: Quest,
  floorNumber: number,
) {
  return {
    postId: raw.id,
    floorNumber: floorNumber,
    createdAtUtc: raw.created_at,
    userId: raw.user_id,
    isPostOwner: raw.user_id === quest.postOwner,
    content: raw.content,
    imageUrl: !raw.attachment_base ? undefined : (() => {
      const fullImageName = `${raw.attachment_base}${raw.attachment_extension}`;
      const imageName = fullImageName.split("/")[1];
      return `${quest.lfsBaseUrl}/${quest.folder}/${quest.name}/attachments/${imageName}`;
    })(),
  } as Post;
}

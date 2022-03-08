# 结构

顺序是：

- 输入：`Props` -> `Slots` -> `Injects`
- 综合：`Store`
- 输出：`Emits` -> `Provides`
- `Children`

## src/components

### QuestPost/QuestPostLoader.vue

用于加载帖子的组件。

TODO：应该单分出来 `QuestPostNotFound` 组件。 TODO: 也许应该只支持 `postId` 作为 prop，而不支持 `post`。

- Props
  - 帖子，二选一：
    - `post` 帖子内容
    - `postId` 帖子的串号。用于从 store 获取帖子
  - `nestLevel` 嵌套层数，如没有则是 0。用于传递给下方的 `QuestPost` 或 `QuestPostFrame`
  - `displayStatus` 显示状态，默认为 `"open"`。主要用于传递给下方，此外参与 `innerIsInsideCollapsed`
    的计算
- Injects
  - `isInsideCollapsedKey`
- Store
  - 读 `currentQuest` 在只提供 `postId` 时由此获取帖子信息
- Emits
  - `expand` 向上传递其下方组建被展开的事件
- Provides
  - `isInsideCollapsedKey` 收到的组建是否在被折叠的组建内
- Children
  - `QuestPost` 或 `QuestPostFrame`

### QuestPost/QuestPostFrame.vue

帖子的框架，被 `QuestPost` 使用。如果要不加载帖子但仍需要帖子框架时（如显示帖子不存在）可以用它。

处理 “折叠” 还有 “固定头部于顶端” 相关的逻辑。

- Props
  - `nestLevel`
  - `displayStatus`
  - …
- Slots
  - `head` 头部的内容
  - `content` 主要内容
- Injects
  - `"offsetTop"`
- Emits
  - `expand`
- Provides
  - `postContentDivKey`
  - `"offsetTop"` 与 “固定头部于顶端” 逻辑有关
- Children
  - (`OverflowMask`)

### QuestPost/QuestPost.vue

- Props
  - `post`
  - `nestLevel`
  - `displayStatus`
- Injects
  - `pageNumberKey` 这个和以下两个应该和改变地址栏有关。TODO：用 src/logic/… 处理这些
  - `currentPageNumberKey`（写入）
  - `currentPostIdKey`（写入）
- Store
  - 读 `isInAutoScrolling` 以便在自动滚动时不更新地址栏
- Emits
  - `expand`
- Children
  - `QuestPostFrame`
    - `QuestPostImage`
    - `QuestPostContent`

### QuestPost/QuestPostContent.vue

- Props
  - `content`
  - `nestLevel`
- Provides
  - `siblingRefLinkCountKey`
- Children
  - `QuestPostRefLink`（动态）

### QuestPost/QuestPostImage.vue

没什么特别的。

### QuestPost/QuestPostRefLink.vue

- Props
  - `postId`
  - `nestLevel`
  - `siblingOrder` 是父帖的第几个引用，用于计算 `z-index`
- Injects
  - `postContentDivKey` 主要是用于把引用放到其下的 `.quest-post-ref-wrapper` 里，防止被 `.prose`
    感染
  - `siblingRefLinkCountKey` 父帖一共有多少引用，用于计算 `z-index`

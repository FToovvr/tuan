
export default {

    // 负数 zIndex，如 `-n` 与第 n 页对应

    initial: 0,

    // 帖的头部
    postHead: 1_000_000,

    // 帖。
    // 如果引用视图没有，超出其父视图外部的部分内容会被裁剪掉？
    post: 2_000_000,

    // 折叠时的遮盖
    overflowMask: 3_000_000,

    // 让悬浮的引用视图不被父引用视图的遮盖效果遮盖到
    floatingPost: 3_100_000,

    // fixed
    fixedWrapper: 4_000_000,
}
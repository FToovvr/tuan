// 改自 https://stackoverflow.com/a/39494245
// TODO: 让滚动更顺畅
// TODO: 在用户移动时取消
export function scrollIntoViewSmoothly(
  args: {
    finalY: number;
    durationMs: DOMHighResTimeStamp;
    onComplete: () => void;
  },
) {
  if (args.durationMs <= 0) {
    window.scrollTo(window.screenX, args.finalY);
    args.onComplete();
    return;
  }

  const startingY = window.scrollY;
  const diff = args.finalY - startingY;
  let startTs: DOMHighResTimeStamp | null = null;

  window.requestAnimationFrame(function step(now) {
    if (!startTs) {
      startTs = now;
    }

    const pastTs = now - startTs;
    const percent = Math.min(pastTs / args.durationMs, 1);
    window.scrollTo(window.screenX, startingY + diff * percent);

    if (pastTs < args.durationMs) {
      window.requestAnimationFrame(step);
    } else {
      window.requestAnimationFrame(args.onComplete);
    }
  });
}

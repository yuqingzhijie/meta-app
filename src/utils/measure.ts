import { MediaTypeEnum } from "../types/passageList.types";

export function remToPx(rem: number): number {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return rem * fontSize;
}

// todo 待优化: options + css var (from lisa on 2025/5/16)
export async function measureItemDomHeight<
  T extends { type: MediaTypeEnum; imgUrl?: string; videoUrl?: string; text: string }
>(item: T, columnWidthRem: number): Promise<number> {
  const widthPx = remToPx(columnWidthRem);
  const textWidthPx = remToPx(columnWidthRem - 0.375 * 2);
  const contentHeight =
    measureTextHeight(item.text, textWidthPx) + remToPx(0.375 * 2 + 0.25 + 1 + 0.5 + 1);
  const marginHeight = remToPx(0.1875);

  if (item.type === MediaTypeEnum.image && item.imgUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = item.imgUrl!;
      img.onload = () => {
        const height =
          (img.naturalHeight / img.naturalWidth) * widthPx + contentHeight + marginHeight;
        resolve(height);
      };
      img.onerror = () => resolve(widthPx + contentHeight + marginHeight);
    });
  } else {
    return new Promise(resolve => {
      const video = document.createElement("video");
      video.src = item.videoUrl!;
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        const height =
          (video.videoHeight / video.videoWidth) * widthPx + contentHeight + marginHeight;
        resolve(height);
      };
      video.onerror = () => resolve(widthPx + contentHeight + marginHeight);
    });
  }
}

let measureDiv: HTMLDivElement | null = null;

/**
 * 测量文本在限定宽度内的渲染高度（px）
 * - 同步页面上 .text 的字体、行高、字体族
 * - 限制最多两行（max-height: 3rem）
 *
 * @param text 要测量的字符串
 * @param widthPx 可用宽度（px）
 * @returns 文本真实渲染高度（不超过 3rem）
 */
export function measureTextHeight(text: string, widthPx: number): number {
  // 初始化或复用测量容器
  if (!measureDiv) {
    measureDiv = document.createElement("div");
    measureDiv.style.position = "absolute";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.whiteSpace = "normal";
    measureDiv.style.wordBreak = "break-word";
    measureDiv.style.zIndex = "-9999";
    measureDiv.style.pointerEvents = "none";
    // 同步页面上第一个 .text 元素的样式
    const ref = document.querySelector(".text");
    if (ref) {
      const cs = getComputedStyle(ref);
      measureDiv.style.fontSize = cs.fontSize;
      measureDiv.style.lineHeight = cs.lineHeight;
      measureDiv.style.fontFamily = cs.fontFamily;
    } else {
      // 可能要加个入参options配置
      // measureDiv.style.fontSize = "16px";
      measureDiv.style.lineHeight = "1.5rem";
      // measureDiv.style.fontFamily = 'sans-serif';
    }
    document.body.appendChild(measureDiv);
  }

  // 设置宽度与内容
  measureDiv.style.width = `${widthPx}px`;
  measureDiv.textContent = text || "";

  // 测量高度
  const heightPx = measureDiv.offsetHeight;
  const maxHeight = remToPx(3); // 3rem 对应的 px

  // 清理内容（保留容器）
  measureDiv.textContent = "";

  // 返回不超过 3rem 的高度
  return Math.min(heightPx, maxHeight);
}

// 动态设置 REM 基准值（基于设计稿 375px）
export const setRemUnit = () => {
  const docEl = document.documentElement;
  const resizeObserver = new ResizeObserver(() => {
    const clientWidth = docEl.clientWidth;
    const rem = (Math.min(clientWidth, 768) / 375) * 16;
    docEl.style.fontSize = rem + "px";
  });
  resizeObserver.observe(docEl);
};

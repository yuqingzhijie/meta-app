import { MediaTypeEnum } from "../types/passageList.types";

export function remToPx(rem: number): number {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return rem * fontSize;
}

export async function measureItemDomHeight<
  T extends { type: MediaTypeEnum; imgUrl?: string; videoUrl?: string }
>(item: T, columnWidthRem: number): Promise<number> {
  const widthPx = remToPx(columnWidthRem);
  if (item.type === MediaTypeEnum.image && item.imgUrl) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = item.imgUrl!;
      img.onload = () => {
        const height = (img.naturalHeight / img.naturalWidth) * widthPx;
        resolve(height);
      };
      img.onerror = () => resolve(widthPx);
    });
  } else {
    return new Promise(resolve => {
      const video = document.createElement("video");
      video.src = item.videoUrl!;
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = () => {
        const height = (video.videoHeight / video.videoWidth) * widthPx;
        resolve(height);
      };
      video.onerror = () => resolve(widthPx);
    });
  }
}

import type { SyntheticEvent } from 'react';

/** Card-size copy (800x450) of an article's cover photo. Falls back to the full image if no thumbnail was made for it. */
export const blogThumb = (cover: string) => `/images/blog-thumbs/${cover.split('/').pop()}`;

export function fullImageFallback(original: string) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.src.includes('/blog-thumbs/')) img.src = original;
  };
}

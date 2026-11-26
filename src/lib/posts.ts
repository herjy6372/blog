import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';

export type Post = CollectionEntry<'posts'>;

export const postSlug = (p: Post) => p.id.split('/').slice(1).join('/');
export const postLang = (p: Post) => p.id.split('/')[0] as Lang;

/** 한 언어의 글을 최신(order 큰 것) 순으로 */
export async function getPosts(lang: Lang) {
  const all = await getCollection('posts', (p) => postLang(p) === lang);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.data.order - a.data.order);
}

/** 한국어는 분당 약 500자, 영어는 분당 약 220단어 기준 */
export function readingMinutes(p: Post, lang: Lang) {
  const body = p.body ?? '';
  const n = lang === 'ko' ? body.replace(/\s/g, '').length / 500 : body.split(/\s+/).length / 220;
  return Math.max(1, Math.round(n));
}

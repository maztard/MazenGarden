import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title),
  );
}

export function postUrl(post: BlogPost): string {
  return withBase(`/blog/${post.id}/`);
}

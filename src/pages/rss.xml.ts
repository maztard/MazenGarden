import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPublishedPosts, postUrl } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const site = new URL(import.meta.env.BASE_URL, context.site ?? context.url.origin);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: site.href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
    })),
    customData: '<language>en-us</language>',
  });
}

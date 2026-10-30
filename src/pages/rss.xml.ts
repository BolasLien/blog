import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { formatDateParams } from '../utils/dates';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: "Bolas 的開發與學習筆記",
    description: "前端工程師的技術學習筆記、踩過的坑，以及軟體開發心得",
    site: new URL(import.meta.env.BASE_URL, context.site!).href,
    items: sorted.map((post) => {
      const { year, month, day } = formatDateParams(post.data.date);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `${year}/${month}/${day}/${post.id}/`,
      };
    }),
    customData: `<language>zh-tw</language>`,
  });
}

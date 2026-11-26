import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { t, href, LANGS, type Lang } from '../../i18n';
import { getPosts, postSlug } from '../../lib/posts';

export const getStaticPaths = () => LANGS.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const ui = t(lang);
  const posts = await getPosts(lang);
  return rss({
    title: ui.siteName,
    description: ui.siteDescription,
    site: new URL(href(lang), context.site).toString(),
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: href(lang, `posts/${postSlug(p)}/`),
    })),
    customData: `<language>${lang}</language>`,
  });
}

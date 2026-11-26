import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // src/content/posts/ko/slug.md → id 'ko/slug'
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(['flutter', 'native', 'security', 'deploy']),
    project: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };

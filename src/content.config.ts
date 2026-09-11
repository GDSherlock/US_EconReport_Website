import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { isISODate } from './lib/report-utils.mjs';

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.string().refine(isISODate, 'Use a real calendar date in YYYY-MM-DD format'),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    takeaways: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
    focus: z.string().optional(),
  }),
});
export const collections = { reports };

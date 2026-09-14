import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { isISODate } from './lib/report-utils.mjs';

const reports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/reports' }),
  schema: z.object({
    locale: z.enum(['zh', 'en']).default('zh'),
    title: z.string().min(1),
    date: z.string().refine(isISODate, 'Use a real calendar date in YYYY-MM-DD format'),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    takeaways: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
    focus: z.string().optional(),
    charts: z.array(z.object({
      chartId: z.string().min(1), releaseId: z.string().min(1),
      range: z.object({from:z.string(),to:z.string()}),
      caption: z.string().min(1), versionNote: z.string().min(1),
      selectedPeriod: z.string().optional(),
    })).optional(),
  }),
});
export const collections = { reports };

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: z.string(),
	pubDate: z.coerce.date(),
	// 技术栈/规格，如 "STM32G474", "HRTIM"
	technologies: z.array(z.string()).optional(),
});

const noteSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
});

// English content (default locale)
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: projectSchema,
});
const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: noteSchema,
});

// Chinese content (/zh)
const projectsZh = defineCollection({
	loader: glob({ base: './src/content/zh/projects', pattern: '**/*.{md,mdx}' }),
	schema: projectSchema,
});
const notesZh = defineCollection({
	loader: glob({ base: './src/content/zh/notes', pattern: '**/*.{md,mdx}' }),
	schema: noteSchema,
});

export const collections = { projects, notes, projectsZh, notesZh };

import { defineCollection } from "astro/content/config";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const baseSchema = z.object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(160),
    slug: z.string().min(1).optional(),

    order: z.number().int().positive(),

    authors: z.array(z.string()).default([]),
    contributors: z.array(z.string()).default([]),
    translatedBy: z.array(z.string()).default([]),

    tags: z.array(z.string()).default([]),
    updatedAt: z.coerce.date().default(() => new Date()),
    canonicalUrl: z.url().optional(),
});

const lessons = defineCollection({
    loader: glob({
        base: "./src/content",
        pattern: "**/**/lessons/*.{md,mdx}",
    }),
    schema: baseSchema.extend({
        estimatedMinutes: z.number().positive().optional(),
    }),
});

const challenges = defineCollection({
    loader: glob({
        base: "./src/content",
        pattern: "**/**/challenges/*.{md,mdx}",
    }),
    schema: baseSchema.extend({
        difficulty: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]),
    }),
});

const projects = defineCollection({
    loader: glob({
        base: "./src/content",
        pattern: "**/**/projects/*.{md,mdx}",
    }),
    schema: baseSchema.extend({
        difficulty: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]),
    }),
});

export const collections = {
    lessons,
    challenges,
    projects,
};

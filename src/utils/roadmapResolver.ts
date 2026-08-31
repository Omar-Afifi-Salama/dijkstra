import { getCollection, type CollectionEntry } from "astro:content";
import { roadmaps, type Track } from "../data/roadmaps";

export interface RoadmapStep {
    stepNumber: number;
    type: "lessons" | "challenges" | "projects";
    slug: string;
    url: string;
    title: string;
    description: string;
    difficulty?: string;
    entry: CollectionEntry<"lessons" | "challenges" | "projects">;
}

export async function getTrackRoadmap(
    locale: string,
    track: Track,
): Promise<RoadmapStep[]> {
    const trackSequence = roadmaps[track];
    if (!trackSequence) return [];

    // 1. Fetch all collections in parallel
    const [allLessons, allChallenges, allProjects] = await Promise.all([
        getCollection("lessons"),
        getCollection("challenges"),
        getCollection("projects"),
    ]);

    // 2. Put all items into a fast lookup dictionary: "lessons/01-variables" -> entry
    const itemMap = new Map<string, any>();

    const indexCollection = (items: any[], type: string) => {
        for (const item of items) {
            // item.id looks like "en/python/lessons/01-variables.md"
            const parts = item.id.replace(/\.mdx?$/, "").split("/");
            const itemLocale = parts[0];
            const itemTrack = parts[1];
            const itemSlug = parts.slice(3).join("/"); // "01-variables"

            if (itemLocale === locale && itemTrack === track) {
                itemMap.set(`${type}/${itemSlug}`, item);
            }
        }
    };

    indexCollection(allLessons, "lessons");
    indexCollection(allChallenges, "challenges");
    indexCollection(allProjects, "projects");

    // 3. Map the array sequence into full UI step objects
    const resolvedSteps: RoadmapStep[] = [];

    trackSequence.forEach((key, index) => {
        const entry = itemMap.get(key);
        if (!entry) return; // Skips if the markdown file hasn't been written yet

        const [type, ...slugParts] = key.split("/") as [
            "lessons" | "challenges" | "projects",
            ...string[],
        ];
        const slug = slugParts.join("/");

        resolvedSteps.push({
            stepNumber: index + 1,
            type,
            slug,
            url: `/${locale}/${track}/${type}/${slug}`,
            title: entry.data.title,
            description: entry.data.description,
            difficulty:
                "difficulty" in entry.data ? entry.data.difficulty : undefined,
            entry,
        });
    });

    return resolvedSteps;
}

import { getCollection } from "astro:content";
import { roadmaps, type Track, type ContentType } from "@/data/roadmaps";

export const supportedTracks = Object.keys(roadmaps) as Track[];

export async function getAllCurriculumEntries() {
    const [lessons, challenges, projects] = await Promise.all([
        getCollection("lessons"),
        getCollection("challenges"),
        getCollection("projects"),
    ]);

    return [
        ...lessons.map((e) => ({
            ...e,
            collectionType: "lessons" as ContentType,
        })),
        ...challenges.map((e) => ({
            ...e,
            collectionType: "challenges" as ContentType,
        })),
        ...projects.map((e) => ({
            ...e,
            collectionType: "projects" as ContentType,
        })),
    ];
}

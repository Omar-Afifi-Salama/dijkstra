import { getCollection, type CollectionEntry } from "astro:content";
import { roadmaps, type Track, type ContentType } from "@/data/roadmaps";

export interface NavLink {
    title: string;
    url: string;
    type?: ContentType;
}

export interface NavigationResult {
    prev: NavLink | null;
    next: NavLink | null;
    currentStep?: number;
    totalSteps?: number;
    parentUrl: string;
    parentLabel: string;
}

export async function getNavigation(
    locale: string,
    track: Track,
    type: ContentType,
    slug: string,
    context: "collection" | "roadmap",
): Promise<NavigationResult> {
    const [lessons, challenges, projects] = await Promise.all([
        getCollection("lessons"),
        getCollection("challenges"),
        getCollection("projects"),
    ]);

    const lookup = new Map<string, any>();
    const indexItems = (items: any[], itemType: ContentType) => {
        for (const item of items) {
            const [itemLocale, itemTrack, , ...slugParts] = item.id
                .replace(/\.mdx?$/, "")
                .split("/");
            if (itemLocale === locale && itemTrack === track) {
                const itemSlug = slugParts.join("/");
                lookup.set(`${itemType}/${itemSlug}`, {
                    ...item,
                    type: itemType,
                    itemSlug,
                });
            }
        }
    };

    indexItems(lessons, "lessons");
    indexItems(challenges, "challenges");
    indexItems(projects, "projects");

    if (context === "collection") {
        const categoryItems = Array.from(lookup.values())
            .filter((i) => i.type === type)
            .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));

        const idx = categoryItems.findIndex((i) => i.itemSlug === slug);
        const prev = idx > 0 ? categoryItems[idx - 1] : null;
        const next =
            idx !== -1 && idx < categoryItems.length - 1
                ? categoryItems[idx + 1]
                : null;

        return {
            prev: prev
                ? {
                      title: prev.data.title,
                      url: `/${locale}/${track}/${type}/${prev.itemSlug}`,
                  }
                : null,
            next: next
                ? {
                      title: next.data.title,
                      url: `/${locale}/${track}/${type}/${next.itemSlug}`,
                  }
                : null,
            parentUrl: `/${locale}/${track}/${type}`,
            parentLabel: `All ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        };
    } else {
        const sequence = roadmaps[track] || [];
        const currentKey = `${type}/${slug}`;
        const idx = sequence.indexOf(currentKey as any);

        const prevEntry = idx > 0 ? lookup.get(sequence[idx - 1]) : null;
        const nextEntry =
            idx !== -1 && idx < sequence.length - 1
                ? lookup.get(sequence[idx + 1])
                : null;

        return {
            prev: prevEntry
                ? {
                      title: prevEntry.data.title,
                      url: `/${locale}/${track}/roadmap/${prevEntry.type}/${prevEntry.itemSlug}`,
                  }
                : null,
            next: nextEntry
                ? {
                      title: nextEntry.data.title,
                      url: `/${locale}/${track}/roadmap/${nextEntry.type}/${nextEntry.itemSlug}`,
                  }
                : null,
            currentStep: idx + 1,
            totalSteps: sequence.length,
            parentUrl: `/${locale}/${track}/roadmap`,
            parentLabel: `${track.toUpperCase()} Roadmap`,
        };
    }
}

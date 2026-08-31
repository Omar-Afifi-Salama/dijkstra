// src/pages/og/[...slug].png.ts
import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs/promises";
import path from "node:path";
import { getAllCurriculumEntries, supportedTracks } from "../../utils/routes";
import { supportedLocales, useTranslations } from "../../i18n/utils";

export const prerender = true;

// In-memory font cache: read once at build time
let cachedFonts: { ibm: Buffer; arabic: Buffer } | null = null;

async function getCachedFonts() {
    if (cachedFonts) return cachedFonts;

    let fontDir = path.resolve("./src/assets/fonts");
    try {
        await fs.access(fontDir);
    } catch {
        fontDir = path.resolve("./src/assests/fonts");
    }

    const [ibm, arabic] = await Promise.all([
        fs.readFile(path.join(fontDir, "IBMPlexSans-Bold-Banner.ttf")),
        fs.readFile(path.join(fontDir, "NotoSansArabic-Bold-Banner.ttf")),
    ]);

    cachedFonts = { ibm, arabic };
    return cachedFonts;
}

export async function getStaticPaths() {
    const curriculum = await getAllCurriculumEntries();
    const paths: any[] = [];

    for (const locale of supportedLocales) {
        const { t } = useTranslations(locale);

        // 1. Root Platform Overview Banner
        paths.push({
            params: { slug: `${locale}/index` },
            props: {
                title: "dijkstra_",
                subtitle: t("og.defaultSubtitle"),
                badge: t("og.platformBadge"),
                locale,
            },
        });

        // 2. Track Overview Banners
        for (const track of supportedTracks) {
            const trackName = track.charAt(0).toUpperCase() + track.slice(1);
            paths.push({
                params: { slug: `${locale}/${track}` },
                props: {
                    title: `${trackName} Track`,
                    subtitle: t("og.trackSubtitle", { track: trackName }),
                    badge: t("og.trackBadge"),
                    track: trackName,
                    locale,
                },
            });
        }
    }

    // 3. All individual lessons, challenges, and projects
    for (const item of curriculum) {
        const [locale, track, type, ...slugParts] = item.id
            .replace(/\.mdx?$/, "")
            .split("/");
        const slug = slugParts.join("/");
        const { t } = useTranslations(locale);

        paths.push({
            params: { slug: `${locale}/${track}/${type}/${slug}` },
            props: {
                title: item.data.title,
                subtitle: item.data.description || "",
                badge: t(`sections.${type}`) || type.toUpperCase(),
                track: track.toUpperCase(),
                locale,
            },
        });
    }

    return paths;
}

export const GET: APIRoute = async ({ props }) => {
    const { title, subtitle, badge, track, locale } = props as any;
    const isRtl = locale === "ar";
    const { t } = useTranslations(locale);

    const fonts = await getCachedFonts();

    // PERFORMANCE: Only pass the font needed for the current language
    const activeFonts = isRtl
        ? [
              {
                  name: "Noto Sans Arabic",
                  data: fonts.arabic,
                  weight: 700 as const,
                  style: "normal" as const,
              },
              {
                  name: "IBM Plex Sans",
                  data: fonts.ibm,
                  weight: 700 as const,
                  style: "normal" as const,
              },
          ]
        : [
              {
                  name: "IBM Plex Sans",
                  data: fonts.ibm,
                  weight: 700 as const,
                  style: "normal" as const,
              },
          ];

    // Render in Satori at native 1200x630 (instant layout calculation)
    const svg = await satori(
        {
            type: "div",
            props: {
                style: {
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#090d16",
                    padding: "64px 80px",
                    fontFamily: isRtl ? "Noto Sans Arabic" : "IBM Plex Sans",
                    direction: isRtl ? "rtl" : "ltr",
                },
                children: [
                    // Header Bar: Dijkstra Logo + Badges
                    {
                        type: "div",
                        props: {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                            },
                            children: [
                                {
                                    type: "div",
                                    props: {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        },
                                        children: [
                                            {
                                                type: "span",
                                                props: {
                                                    style: {
                                                        color: "#6366f1",
                                                        fontSize: "38px",
                                                        fontWeight: 700,
                                                        letterSpacing:
                                                            "-0.03em",
                                                    },
                                                    children: "dijkstra_",
                                                },
                                            },
                                        ],
                                    },
                                },
                                {
                                    type: "div",
                                    props: {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        },
                                        children: [
                                            track
                                                ? {
                                                      type: "span",
                                                      props: {
                                                          style: {
                                                              backgroundColor:
                                                                  "rgba(255, 255, 255, 0.06)",
                                                              color: "#94a3b8",
                                                              border: "1px solid rgba(255, 255, 255, 0.12)",
                                                              padding:
                                                                  "6px 14px",
                                                              borderRadius:
                                                                  "6px",
                                                              fontSize: "18px",
                                                              fontWeight: 600,
                                                          },
                                                          children: track,
                                                      },
                                                  }
                                                : null,
                                            {
                                                type: "span",
                                                props: {
                                                    style: {
                                                        backgroundColor:
                                                            "rgba(99, 102, 241, 0.15)",
                                                        color: "#818cf8",
                                                        border: "1px solid rgba(99, 102, 241, 0.3)",
                                                        padding: "6px 14px",
                                                        borderRadius: "6px",
                                                        fontSize: "18px",
                                                        fontWeight: 600,
                                                    },
                                                    children: badge,
                                                },
                                            },
                                        ].filter(Boolean),
                                    },
                                },
                            ],
                        },
                    },

                    // Center: Title & Description
                    {
                        type: "div",
                        props: {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: "18px",
                            },
                            children: [
                                {
                                    type: "h1",
                                    props: {
                                        style: {
                                            color: "#f8fafc",
                                            fontSize:
                                                title.length > 40
                                                    ? "46px"
                                                    : "56px",
                                            fontWeight: 700,
                                            lineHeight: 1.25,
                                            letterSpacing: "-0.02em",
                                            margin: 0,
                                        },
                                        children: title,
                                    },
                                },
                                subtitle
                                    ? {
                                          type: "p",
                                          props: {
                                              style: {
                                                  color: "#94a3b8",
                                                  fontSize: "24px",
                                                  lineHeight: 1.45,
                                                  margin: 0,
                                              },
                                              children:
                                                  subtitle.length > 130
                                                      ? subtitle.slice(0, 127) +
                                                        "..."
                                                      : subtitle,
                                          },
                                      }
                                    : null,
                            ].filter(Boolean),
                        },
                    },

                    // Footer Tagline & URL
                    {
                        type: "div",
                        props: {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                                paddingTop: "24px",
                                color: "#64748b",
                                fontSize: "18px",
                            },
                            children: [
                                {
                                    type: "span",
                                    props: {
                                        children: t("og.footerTagline"),
                                    },
                                },
                                {
                                    type: "span",
                                    props: {
                                        children: "dijkstra.dev",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        } as any,
        {
            width: 1200,
            height: 630,
            fonts: activeFonts,
        },
    );

    // Rasterize with Resvg: fitTo 1800px (1.5x resolution for Retina sharpness with low latency)
    const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: 1800 },
        shapeRendering: 2, // Crisp rendering mode
    });
    const image = resvg.render();

    return new Response(image.asPng() as any, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
};

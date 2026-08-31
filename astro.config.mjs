// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    site: "https://dijkstra-coding.vercel.app",
    integrations: [react()],
    i18n: {
        defaultLocale: "en",
        locales: ["en", "ar"],
        routing: {
            prefixDefaultLocale: true,
            redirectToDefaultLocale: false,
        },
    },
    fonts: [
        {
            provider: fontProviders.local(),
            name: "IBM Plex Sans",
            cssVariable: "--font-ibm-plex-sans",
            options: {
                variants: [
                    {
                        weight: "100 900",
                        style: "normal",
                        src: ["./src/assets/fonts/IBMPlexSans.woff2"],
                    },
                    {
                        weight: "100 900",
                        style: "italic",
                        src: ["./src/assets/fonts/IBMPlexSans-Italic.woff2"],
                    },
                ],
            },
        },
        {
            provider: fontProviders.local(),
            name: "Noto Sans Arabic",
            cssVariable: "--font-noto-sans-arabic",
            options: {
                variants: [
                    {
                        weight: "100 900",
                        style: "normal",
                        src: ["./src/assets/fonts/NotoSansArabic.woff2"],
                    },
                ],
            },
        },
        {
            provider: fontProviders.local(),
            name: "Fira Code",
            cssVariable: "--font-fira-code",
            options: {
                variants: [
                    {
                        weight: "100 900",
                        style: "normal",
                        src: ["./src/assets/fonts/FiraCode.woff2"],
                    },
                ],
            },
        },
    ],
});

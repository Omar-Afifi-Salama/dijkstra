// Auto-import all *.json files in src/i18n/
const localeFiles = import.meta.glob<{ default: Record<string, any> }>(
    "./locales/*.json",
    { eager: true },
);

export const translations: Record<string, Record<string, any>> = {};

for (const path in localeFiles) {
    // Extract "en" from "../i18n/en.json"
    const localeCode = path.split("/").pop()?.replace(".json", "");
    if (localeCode) {
        translations[localeCode] = localeFiles[path].default;
    }
}

// Inferred list of all supported locales: ['ar', 'en', ...]
export const supportedLocales = Object.keys(translations);

export function useTranslations(locale: string) {
    const dict = translations[locale] || translations["en"] || {};

    return {
        t: (
            keyPath: string,
            vars?: Record<string, string | number>,
        ): string => {
            const keys = keyPath.split(".");
            let result: any = dict;

            for (const k of keys) {
                result = result?.[k];
                if (result === undefined) break;
            }

            if (typeof result !== "string") return keyPath;

            if (vars) {
                return Object.entries(vars).reduce(
                    (acc, [vKey, val]) => acc.replace(`{${vKey}}`, String(val)),
                    result,
                );
            }

            return result;
        },
        dir: dict.dir || "ltr",
    };
}

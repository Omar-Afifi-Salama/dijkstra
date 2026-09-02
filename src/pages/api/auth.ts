// src/pages/api/auth.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ redirect, url }) => {
    const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
    const redirectUri = `${url.origin}/api/callback`;

    // GitHub Apps derive permissions from installation settings, so no scope parameter is required
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
    )}`;

    return redirect(githubAuthUrl, 302);
};

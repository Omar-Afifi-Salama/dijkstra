import type { APIRoute } from "astro";

export const prerender = false; // Serverless endpoint

export const GET: APIRoute = async ({ redirect, url }) => {
    const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
    const host = url.origin;
    const redirectUri = `${host}/api/callback`;
    const scope = "repo,user";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
    )}&scope=${scope}`;

    return redirect(githubAuthUrl, 302);
};

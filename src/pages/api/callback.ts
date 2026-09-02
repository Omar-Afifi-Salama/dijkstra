// src/pages/api/callback.ts
import type { APIRoute } from "astro";

export const prerender = false;

// List allowed GitHub handles (lowercase)
const allowedList = (import.meta.env.CMS_ALLOWED_USERS || "")
    .split(",")
    .map((u: string) => u.trim().toLowerCase())
    .filter(Boolean);

const ALLOWED_USERS = new Set(allowedList);

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get("code");
    const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.OAUTH_GITHUB_CLIENT_SECRET;

    if (!code) {
        return new Response(
            renderHtml("error", { message: "No authorization code provided." }),
            {
                status: 400,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            },
        );
    }

    try {
        // 1. Exchange code for access token
        const tokenResponse = await fetch(
            "https://github.com/login/oauth/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                }),
            },
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.error || !tokenData.access_token) {
            return new Response(
                renderHtml("error", {
                    message:
                        tokenData.error_description || "Authentication failed.",
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                },
            );
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch authenticated GitHub user details
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "dijkstra-cms-auth",
            },
        });

        if (!userResponse.ok) {
            return new Response(
                renderHtml("error", {
                    message: "Failed to verify GitHub user profile.",
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                },
            );
        }

        const userData = await userResponse.json();
        const username = userData.login?.toLowerCase();

        // 3. Check against whitelist
        if (!ALLOWED_USERS.has(username)) {
            return new Response(
                renderHtml("error", {
                    message: `Access denied. @${userData.login} is not authorized to access the dijkstra CMS dashboard.`,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                },
            );
        }

        // 4. Return success to Decap CMS
        return new Response(
            renderHtml("success", { token: accessToken, provider: "github" }),
            {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            },
        );
    } catch (err: any) {
        return new Response(
            renderHtml("error", {
                message: err?.message || "Internal server error.",
            }),
            {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            },
        );
    }
};

function renderHtml(status: "success" | "error", content: Record<string, any>) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Authorizing Decap CMS...</title>
  </head>
  <body style="font-family: sans-serif; text-align: center; padding-top: 40px; background: #090d16; color: #f3f4f6;">
    <p>Verifying permissions...</p>
    <script>
      (function() {
        var status = ${JSON.stringify(status)};
        var content = ${JSON.stringify(content)};

        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:' + status + ':' + JSON.stringify(content),
            e.origin
          );
          window.removeEventListener("message", receiveMessage, false);
          window.close();
        }

        window.addEventListener("message", receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage("authorizing:github", "*");
        } else {
          document.body.innerHTML = "<p style='color: #ef4444;'>Error: Parent window not found.</p>";
        }
      })();
    </script>
  </body>
</html>`;
}

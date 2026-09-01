// src/pages/api/callback.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get("code");
    const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.OAUTH_GITHUB_CLIENT_SECRET;

    if (!code) {
        return new Response(
            renderHtml("error", {
                message: "No authorization code provided by GitHub.",
            }),
            {
                status: 400,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            },
        );
    }

    try {
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

        const data = await tokenResponse.json();

        if (data.error || !data.access_token) {
            return new Response(
                renderHtml("error", {
                    message:
                        data.error_description ||
                        data.error ||
                        "GitHub token exchange failed.",
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                },
            );
        }

        return new Response(
            renderHtml("success", {
                token: data.access_token,
                provider: "github",
            }),
            {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            },
        );
    } catch (err: any) {
        return new Response(
            renderHtml("error", {
                message: err?.message || "Internal server error during auth.",
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
    <p>Completing authentication...</p>
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
          document.body.innerHTML = "<p style='color: #ef4444;'>Error: Parent window not found. Please close and try again.</p>";
        }
      })();
    </script>
  </body>
</html>`;
}

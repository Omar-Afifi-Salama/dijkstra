import type { APIRoute } from "astro";

export const prerender = false; // Serverless endpoint

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get("code");
    const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
    const clientSecret = import.meta.env.OAUTH_GITHUB_CLIENT_SECRET;

    if (!code) {
        return new Response("Missing authorization code", { status: 400 });
    }

    try {
        const response = await fetch(
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

        const data = await response.json();

        if (data.error || !data.access_token) {
            return new Response(
                renderMessage("error", {
                    message: data.error_description || "Auth failed",
                }),
                { headers: { "Content-Type": "text/html" } },
            );
        }

        // Decap expects the access token inside a postMessage payload
        const content = renderMessage("success", {
            token: data.access_token,
            provider: "github",
        });

        return new Response(content, {
            headers: { "Content-Type": "text/html" },
        });
    } catch (err: any) {
        return new Response(
            renderMessage("error", {
                message: err.message || "Internal server error",
            }),
            { headers: { "Content-Type": "text/html" } },
        );
    }
};

function renderMessage(
    status: "success" | "error",
    content: Record<string, any>,
) {
    return `<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:${status}:${JSON.stringify(content)}',
            e.origin
          );
          window.removeEventListener("message", receiveMessage, false);
          window.close();
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`;
}

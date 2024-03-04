import isLocalhostIP from "is-localhost-ip";

const server = Bun.serve({
  port: 6754,
  async fetch(req) {
    try {
      const rest = req.url.split("/").slice(3).join("/");
      const url = new URL(rest);

      if (await isLocalhostIP(url.hostname)) {
        return new Response("Localhost IP is not allowed.");
      }

      console.log(`Fetching ${req.method} ${url.href}`);

      const reqHeaders = { ...req.headers };

      delete reqHeaders["host"];
      delete reqHeaders["origin"];
      delete reqHeaders["referer"];
      delete reqHeaders["content-length"];
      delete reqHeaders["content-type"];

      const res = await fetch(url.href, {
        method: req.method,
        headers: reqHeaders,
        body: req.body
      });

      let resHeaders = { ...res.headers };

      delete resHeaders["content-security-policy"];
      delete resHeaders["x-frame-options"];
      delete resHeaders["x-xss-protection"];
      delete resHeaders["x-content-type-options"];
      delete resHeaders["referrer-policy"];

      resHeaders["access-control-allow-origin"] = "*";
      resHeaders["access-control-allow-credentials"] = "true";
      resHeaders["access-control-allow-headers"] = "*";
      resHeaders["access-control-allow-methods"] = "*";

      return new Response(res.body, {
        headers: resHeaders,
        status: res.status,
      });
    } catch (err) {
      return new Response(err.message);
    }
  },
});

console.log(`Server is running on port ${server.port}`);
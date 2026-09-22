/* Minimal static file server for local design-system preview only. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = process.env.PORT || 8777;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/styleguide.html";
    const filePath = path.join(root, urlPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`LMX preview on http://localhost:${port}`));

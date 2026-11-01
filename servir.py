"""Servidor local del portfolio, sin dependencias externas."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PortfolioHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # Serve the current file even if a browser cached an earlier version.
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    folder = Path(__file__).resolve().parent
    handler = partial(PortfolioHandler, directory=str(folder))
    server = ThreadingHTTPServer(("127.0.0.1", 8080), handler)
    print("Portfolio disponible en http://localhost:8080", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

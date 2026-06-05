#!/usr/bin/env python3
"""Dev-only static server for the consulting LAB with a /feedback POST sink.
Serves ~/loops.uz on :8765 and writes annotation comments to .lab-feedback.json
so Claude can read them directly (no copy-paste). NOT for production."""
import http.server, socketserver, os, json

ROOT = os.path.expanduser("~/loops.uz")
PORT = 8765
FEEDBACK = os.path.join(ROOT, ".lab-feedback.json")

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_POST(self):
        if self.path.rstrip("/") == "/feedback":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                parsed = json.loads(body.decode("utf-8"))
                with open(FEEDBACK, "w", encoding="utf-8") as f:
                    json.dump(parsed, f, ensure_ascii=False, indent=2)
                ok = True
            except Exception as e:
                ok = False
            self.send_response(200 if ok else 400)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": ok}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass

os.chdir(ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"LAB server on http://localhost:{PORT}  (feedback → {FEEDBACK})")
    httpd.serve_forever()

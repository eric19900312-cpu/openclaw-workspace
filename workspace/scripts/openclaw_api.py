#!/usr/bin/env python3
"""
OpenClaw HTTP API Server
将 OpenClaw CLI 包装成 HTTP API
"""

import subprocess
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8080
OPENCLAW_TOKEN = "22a7ec525705df7409a2eca25782246c5f7063b7a0bb252f"

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            self.handle_chat()
        else:
            self.send_error(404, "Not Found")
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_error(404, "Not Found")
    
    def handle_chat(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            message = data.get('message', '')
            session = data.get('session', 'default')
            
            # 调用 OpenClaw agent
            cmd = [
                'openclaw', 'agent',
                '-m', message,
                '--session-id', session
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd='/home/eric/.openclaw/workspace'
            )
            
            reply = result.stdout if result.returncode == 0 else result.stderr
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'reply': reply,
                'session': session
            }).encode())
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def log_message(self, format, *args):
        print(f"[API] {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('', PORT), Handler)
    print(f"OpenClaw API Server running on port {PORT}")
    server.serve_forever()

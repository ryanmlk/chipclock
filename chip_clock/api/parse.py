from http.server import BaseHTTPRequestHandler
import json
import logging
import os
from .gmail_worker import process_latest_schedules

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Get the Authorization header from the request
        auth_header = self.headers.get('Authorization')
        
        # 2. Check if the header matches your CRON_SECRET
        expected_auth = f"Bearer {os.environ.get('CRON_SECRET')}"
        
        # Only enforce security if CRON_SECRET is set in the environment
        if os.environ.get('CRON_SECRET') and auth_header != expected_auth:
            logging.warning("Unauthorized cron request attempt.")
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b"Unauthorized")
            return

        logging.info("Cron job triggered: processing schedules...")
        try:
            success = process_latest_schedules()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success",
                "processed": success
            }).encode('utf-8'))
        except Exception as e:
            logging.error(f"Error in cron handler: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "error",
                "message": str(e)
            }).encode('utf-8'))

    def do_POST(self):
        # Allow POST for webhook triggers if needed in the future
        self.do_GET()

if __name__ == "__main__":
    # For local testing without a full HTTP server
    logging.info("Starting manual schedule processing...")
    process_latest_schedules()

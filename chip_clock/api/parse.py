from http.server import BaseHTTPRequestHandler
import json
import logging
from .gmail_worker import process_latest_schedules

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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

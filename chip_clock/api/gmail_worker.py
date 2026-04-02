import datetime
import logging
import os
import base64
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from io import BytesIO

from .schedule_parser import parse_schedule

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    """Authenticate and return the Gmail API service."""
    # Priority 1: GMAIL_TOKEN environment variable (JSON string)
    # Priority 2: token.json file
    creds = None
    token_json = os.environ.get("GMAIL_TOKEN")
    
    if token_json:
        try:
            creds_data = json.loads(token_json)
            creds = Credentials.from_authorized_user_info(creds_data, SCOPES)
        except Exception as e:
            logging.error(f"Failed to load credentials from GMAIL_TOKEN env: {e}")

    if not creds and os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Update token.json if running locally
                if not os.environ.get("VERCEL"):
                    with open('token.json', 'w') as token:
                        token.write(creds.to_json())
            except Exception as e:
                logging.error(f"Failed to refresh token: {e}")
                return None
        else:
            logging.error("No valid credentials found. Please run authentication locally first.")
            return None

    return build('gmail', 'v1', credentials=creds)

def process_latest_schedules():
    """Fetch recent schedule emails and parse their PDF attachments."""
    service = get_gmail_service()
    if not service:
        return False

    # Search for emails with label "Chipotle Schedule" and PDF attachments
    # We look for messages from the last 7 days to be safe
    query = 'label:"Chipotle/Chipotle Schedule" has:attachment filename:pdf'
    try:
        results = service.users().messages().list(userId='me', q=query, maxResults=2).execute()
        messages = results.get('messages', [])
    except HttpError as e:
        logging.error(f"Error fetching Gmail messages: {e}")
        return False

    if not messages:
        logging.info("No matching messages found.")
        return True

    success_count = 0
    for message in messages:
        msg_id = message['id']
        try:
            msg = service.users().messages().get(userId='me', id=msg_id).execute()
            
            # Check for PDF attachments
            for part in msg['payload'].get('parts', []):
                if 'filename' in part and part['filename'].lower().endswith('.pdf'):
                    att_id = part['body']['attachmentId']
                    attachment = service.users().messages().attachments().get(
                        userId='me',
                        messageId=msg_id,
                        id=att_id
                    ).execute()

                    data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
                    pdf_file = BytesIO(data)
                    
                    logging.info(f"Parsing schedule from message {msg_id}")
                    if parse_schedule(pdf_file):
                        success_count += 1
                        
        except Exception as e:
            logging.error(f"Error processing message {msg_id}: {e}")

    logging.info(f"Processed {success_count} new schedules.")
    return True

if __name__ == "__main__":
    process_latest_schedules()

import datetime
import logging
import os
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from azure_blob_utils import upload_schedule_to_blob

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CREDENTIALS_PATH = os.environ.get("CREDENTIALS_FILE_PATH", "credentials.json")
TOKEN_PATH = os.environ.get("TOKEN_FILE_PATH", "token.json")
SCHEDULE_FILE_PATH = os.environ.get("SCHEDULE_FILE_PATH", "latest_schedule.pdf")

def authenticate_gmail():
    if os.path.exists(CREDENTIALS_PATH):
        creds = None
        if os.path.exists(TOKEN_PATH):
            creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        elif not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(
                port=8080,
                authorization_prompt_message="Please visit this URL: {url}",
                success_message="The auth flow is complete; you may close this window.",
                access_type="offline",          # this is key
                prompt="consent"                # ensures refresh_token is issued every time
            )
            with open(TOKEN_PATH, 'w') as token:
                token.write(creds.to_json())
        return build('gmail', 'v1', credentials=creds)
    else:
        raise FileNotFoundError(f"Credentials file not found at {CREDENTIALS_PATH}")

def fetch_latest_schedule():
    try:
        service = authenticate_gmail()
    except Exception as e:
        logging.error(f"Failed to authenticate Gmail: {e}")
        return None

    query = 'label:"Chipotle Schedule" has:attachment filename:pdf'
    try:
        results = service.users().messages().list(userId='me', q=query, maxResults=1).execute()
        messages = results.get('messages', [])
    except HttpError as e:
        logging.error(f"Error fetching Gmail messages: {e}")
        return None

    if not messages:
        logging.info("No matching messages found.")
        return None

    msg = service.users().messages().get(userId='me', id=messages[0]['id']).execute()

    # Extract internal timestamp
    internal_date = int(msg.get("internalDate", 0))
    email_datetime = datetime.datetime.fromtimestamp(internal_date / 1000, tz=datetime.timezone.utc)
    filename_timestamp = email_datetime.strftime("%Y%m%d_%H%M%S")
    blob_name = f"schedule_{filename_timestamp}.pdf"

    # Look for PDF attachment
    for part in msg['payload'].get('parts', []):
        if 'filename' in part and part['filename'].endswith('.pdf'):
            att_id = part['body']['attachmentId']
            att = service.users().messages().attachments().get(
                userId='me',
                messageId=msg['id'],
                id=att_id
            ).execute()

            data = base64.urlsafe_b64decode(att['data'].encode('UTF-8'))

            uploaded_blob = upload_schedule_to_blob(data, blob_name)

            logging.info(f"Uploaded schedule as blob: {uploaded_blob}")
            return uploaded_blob

    logging.warning("No PDF attachment found.")
    return None

fetch_latest_schedule()


import logging
import azure.functions as func
import os
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import datetime
import sys
from gmail_worker import fetch_latest_schedule
from schedule_parser import parse_schedule

app = func.FunctionApp()
key_vault_url = os.environ["KEY_VAULT_URL"]

def load_credentials_from_keyvault():
    gmail_credentials_name = os.environ.get("CREDENTIALS_SECRET_NAME", "credentials")
    gmail_token_name = os.environ.get("TOKEN_SECRET_NAME", "gmail-token")

    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=key_vault_url, credential=credential)

    gmail_credentials = client.get_secret(gmail_credentials_name)
    logging.info(f"Retrieved secret '{gmail_credentials_name}' from Azure Key Vault.")
    gmail_token = client.get_secret(gmail_token_name)
    logging.info(f"Retrieved secret '{gmail_token_name}' from Azure Key Vault.")
    credentials_file_path = os.environ.get("CREDENTIALS_FILE_PATH", "credentials.json")
    token_file_path = os.environ.get("TOKEN_FILE_PATH", "token.json")
    with open(credentials_file_path, "w") as f:
        if gmail_credentials.value:
            f.write(gmail_credentials.value)
            logging.info(f"Credentials written to {credentials_file_path}.")
        else:
            logging.error("No credentials found in Azure Key Vault secret.")
    with open(token_file_path, "w") as f:
        if gmail_token.value:
            f.write(gmail_token.value)
            logging.info(f"Token written to {token_file_path}.")
        else:
            logging.error("No token found in Azure Key Vault secret.")

@app.schedule(schedule="0 0 20-04 * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=False) 
def fetch_schedule(myTimer: func.TimerRequest) -> None:
    logging.info('Gmail worker function triggered at %s', datetime.datetime.now(datetime.timezone.utc))
    logging.info(f"Using Python: {sys.executable}")
    load_credentials_from_keyvault()
    logging.info('Credentials loaded from Azure Key Vault.')
    blob_name = fetch_latest_schedule()
    if blob_name:
        parse_schedule(blob_name)
        logging.info('Schedule updated from latest Gmail PDF.')
    else:
        logging.warning('No schedule PDF found.')
    
    if myTimer.past_due:
        logging.info('The timer is past due!')

    logging.info('Python timer trigger function executed.')
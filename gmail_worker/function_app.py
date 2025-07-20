import azure.functions as func
import datetime
import logging
from app.gmail_worker import fetch_latest_schedule
from app.schedule_parser import parse_schedule
import sys
import os
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

app = func.FunctionApp()

def load_credentials_from_keyvault(filename="credentials.json"):
    key_vault_url = os.environ["KEY_VAULT_URL"]
    secret_name = os.environ.get("CREDENTIALS_SECRET_NAME", "gmail-credentials")

    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=key_vault_url, credential=credential)

    secret = client.get_secret(secret_name)
    with open(filename, "w") as f:
        f.write(secret.value)
        
@app.timer_trigger(schedule="0 0 16-23 * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=False) 
def fetch_schedule(myTimer: func.TimerRequest) -> None:
    logging.info('Gmail worker function triggered at %s', datetime.datetime.now(datetime.timezone.utc))
    load_credentials_from_keyvault()
    logging.info('Credentials loaded from Azure Key Vault.')
    pdf_path = fetch_latest_schedule()
    if pdf_path:
        parse_schedule(pdf_path)
        logging.info('Schedule updated from latest Gmail PDF.')
    else:
        logging.warning('No schedule PDF found.')
    
    if myTimer.past_due:
        logging.info('The timer is past due!')

    logging.info('Python timer trigger function executed.')
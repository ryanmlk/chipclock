import logging
from azure.storage.blob import BlobServiceClient
import os

AZURE_CONTAINER_NAME = "chipotle-schedules"
STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING", "")
SCHEDULE_PATH = "/tmp/schedule.pdf"

def upload_schedule_to_blob(data, blob_name):
    # Set up Azure Blob Storage
    blob_service_client = BlobServiceClient.from_connection_string(STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)

    # Check if blob already exists
    try:
        container_client.get_blob_client(blob_name).get_blob_properties()
        logging.info(f"Blob {blob_name} already exists. Skipping upload.")
        return None
    except Exception:
        pass  # Blob doesn't exist; continue
    
    # Upload to blob storage
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(data)

    logging.info(f"Uploaded schedule as blob: {blob_name}")
    return blob_name

def read_schedule_from_blob(blob_name):
    blob_service_client = BlobServiceClient.from_connection_string(STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    
    try:
        blob_client = container_client.get_blob_client(blob_name)
        blob_data = blob_client.download_blob().readall()
        logging.info(f"Read schedule from blob: {blob_name}") 
        # Save the blob data to the schedule path
        with open(SCHEDULE_PATH, "wb") as file:
            file.write(blob_data)
        logging.info(f"Saved schedule to {SCHEDULE_PATH}")
        return SCHEDULE_PATH
    except Exception as e:
        logging.error(f"Failed to read blob {blob_name}: {e}")
        return None
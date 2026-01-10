FROM python:3.10

WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y ghostscript libglib2.0-0 libsm6 libxext6 libxrender-dev
RUN pip install --upgrade pip && pip install -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

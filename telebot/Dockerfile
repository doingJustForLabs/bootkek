FROM python:3.12-slim

WORKDIR /app

COPY telebot/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY telebot/.env .
COPY telebot/main.py .
COPY telebot/scripts/ ./scripts/
COPY telebot/app/ ./app/

CMD ["python", "main.py"]
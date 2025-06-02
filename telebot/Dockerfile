FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .
#COPY scripts/ ./scripts/
#COPY app/ ./app/

CMD ["python", "main.py"]
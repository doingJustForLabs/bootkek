FROM python:3.12-slim

WORKDIR app/

COPY requirements.txt .
COPY .dockerignore .

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
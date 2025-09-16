FROM python:3.11-slim

WORKDIR /app

RUN pip install requests

COPY simulator.py .

CMD ["python", "simulator.py"]

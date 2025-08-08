FROM python:3.10

RUN apt-get update -y
RUN apt-get install -y curl

COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
RUN rm /app/requirements.txt

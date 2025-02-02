FROM python:3.11-slim

ENV ENVIRONMENT production

WORKDIR /opt

COPY ./requirements.txt /opt/app/requirements.txt
RUN pip install --upgrade pip

RUN pip install --no-cache-dir --upgrade -r /opt/app/requirements.txt
RUN echo "done install"

COPY ./app /opt/app
COPY ./logging.yaml /opt/logging.yaml

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-config", "/opt/logging.yaml", "--log-level", "info"]
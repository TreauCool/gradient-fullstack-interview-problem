FROM golang:1.24

RUN go install github.com/air-verse/air@v1.62.0

COPY go.mod go.sum /app/
RUN cd /app && go mod download
RUN cd /app && go mod tidy

RUN rm /app/go.mod
RUN rm /app/go.sum
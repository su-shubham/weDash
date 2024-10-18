# Use golang alpine as base image
FROM golang:1.20-alpine

# Install necessary build tools and dependencies
RUN apk add --no-cache \
    git \
    protoc \
    protobuf-dev \
    ca-certificates \
    gcc \
    musl-dev \
    sqlite \
    sqlite-libs

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Install protoc generators
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

# Download dependencies
RUN go mod download && go mod tidy

# Copy the entire project
COPY . .

# Generate proto files
RUN protoc --go_out=. --go-grpc_out=. ./proto/*.proto

# Create data directory for SQLite
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose the application port
EXPOSE 8080

# Command to run when container starts
CMD ["go", "run", "main.go"]
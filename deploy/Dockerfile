# syntax=docker.io/docker/dockerfile:1.7-labs

# Build Angular project
FROM node:latest as angular
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --maxsockets 1

COPY --exclude=deploy . .
RUN npm run build --omit=dev

# Using Nginx webserver
FROM nginx:alpine

COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/nginx.proxy.conf /etc/nginx/nginx.proxy.conf

COPY --from=angular /app/dist/schedule/browser /usr/share/nginx/html

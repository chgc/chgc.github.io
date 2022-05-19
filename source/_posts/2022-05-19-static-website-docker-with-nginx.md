---
layout: post
title: '[筆記] Dockerfile for 建置靜態網站與使用 nginx 來跑'
comments: true
typora-root-url: 2022-05-19-static-website-docker-with-nginx
typora-copy-images-to: 2022-05-19-static-website-docker-with-nginx
date: 2022-05-19 23:03:30
categories: Docker
tags: Docker
---

每次都要想 Dockerfile 怎麼寫，乾脆筆記起來. build static website & run with nginx

<!-- more -->

```dockerfile
FROM node:lts-alpine as builder

ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app
COPY . /app

RUN npm install

RUN npm run build

## production environment
FROM nginx:stable-alpine as deploy
COPY --from=builder /app/build /usr/share/nginx/html
```


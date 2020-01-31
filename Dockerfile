FROM node:8.10.0

WORKDIR /app/
COPY . .

ENV TZ Asia/Singapore

RUN echo "Asia/Singapore" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

ENV PORT 9800

CMD ["node", "app.js"]

EXPOSE 9800

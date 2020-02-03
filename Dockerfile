FROM node:8.10.0

WORKDIR /app/
COPY . .

ENV PORT 9800

RUN npm install

RUN chmod +x ./wait-for-it.sh

CMD ["./wait-for-it.sh", "--timeout=0", "mysql:3306", "--", "sh", "container-start.sh"]

EXPOSE 9800

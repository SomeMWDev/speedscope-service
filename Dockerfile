FROM node:slim

WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD sh -c "npx prisma migrate deploy && node dist/src/server.js"

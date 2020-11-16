FROM node

WORKDIR /root

COPY . .
RUN ls && pwd
RUN npm i

EXPOSE 8080
CMD ["npm", "start"]
